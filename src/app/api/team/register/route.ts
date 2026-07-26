import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role = "user" } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "E-posta, şifre ve ad soyad alanları zorunludur." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // 1. Çağıran Admin kullanıcısını doğrula (Cookie veya Bearer Token)
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let adminClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    });

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      adminClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }) as any;
    }

    const { data: { user: adminUser }, error: adminAuthError } = await adminClient.auth.getUser();

    if (adminAuthError || !adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // 2. Adminin rolünü kontrol et
    const { data: adminProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, company_id")
      .eq("id", adminUser.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Personel ekleme işlemi için Admin yetkisi gereklidir." },
        { status: 403 }
      );
    }

    // 3. Admin oturumunu bozmadan yeni bir Auth kullanıcısı oluştur
    const tempAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: newAuthData, error: signUpError } = await tempAuthClient.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Bu e-posta adresiyle kayıtlı bir hesap zaten bulunuyor." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: signUpError.message || "Kullanıcı kaydı başarısız oldu." },
        { status: 400 }
      );
    }

    const targetUserId = newAuthData.user?.id;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Kullanıcı kimliği oluşturulamadı." },
        { status: 500 }
      );
    }

    // 4. Yeni kullanıcıyı Adminin şirketine bağla (RPC add_user_to_my_company)
    const { data: rpcResult, error: rpcError } = await adminClient.rpc(
      "add_user_to_my_company",
      {
        p_target_user_id: targetUserId,
        p_role: role,
      }
    );

    if (rpcError || (rpcResult as any)?.error) {
      const errMsg = (rpcResult as any)?.error || rpcError?.message || "Kullanıcı şirkete bağlanırken hata oluştu.";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Personel başarıyla eklendi ve şirkete bağlandı.",
      userId: targetUserId,
      companyId: adminProfile.company_id,
    });
  } catch (error: any) {
    console.error("[TEAM_REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Sunucu tarafında bir hata oluştu." },
      { status: 500 }
    );
  }
}
