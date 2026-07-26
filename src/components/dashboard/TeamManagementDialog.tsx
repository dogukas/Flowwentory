"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Lock,
  User,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenantStore } from "@/store/useTenantStore";

interface TeamMember {
  id: string;
  full_name: string;
  role: "admin" | "user" | "viewer";
  created_at: string;
  email: string;
}

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({
  open,
  onOpenChange,
}: TeamManagementDialogProps) {
  const { userRole, company, userId } = useTenantStore();
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "viewer">("user");
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_company_team_members"
      );
      if (rpcError) {
        throw rpcError;
      }
      if (data) {
        setMembers(data as TeamMember[]);
      }
    } catch (err: any) {
      console.error("Ekip üyeleri yüklenemedi:", err);
      setError(err?.message || "Ekip listesi alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      setActiveTab("list");
      setError(null);
      setSuccessMsg(null);
    }
  }, [open]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/team/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Kayıt işlemi başarısız oldu.");
      }

      setSuccessMsg(
        `${fullName} adlı kullanıcı "${
          role === "user" ? "Kullanıcı" : "Gözlemci"
        }" rolüyle ekibe katıldı!`
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("user");

      // Refetch and switch back to list after 1.5s
      await fetchTeamMembers();
      setTimeout(() => {
        setActiveTab("list");
        setSuccessMsg(null);
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "Personel eklenirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "update_team_member_role",
        {
          p_target_user_id: targetUserId,
          p_role: newRole,
        }
      );
      if (rpcError || (data as any)?.error) {
        alert((data as any)?.error || rpcError?.message || "Rol güncellenemedi");
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === targetUserId ? { ...m, role: newRole as any } : m))
      );
    } catch (err) {
      console.error("Rol güncelleme hatası:", err);
    }
  };

  const handleRemoveMember = async (targetUserId: string, memberName: string) => {
    if (
      !confirm(
        `"${memberName}" adlı kullanıcıyı şirketten çıkarmak istediğinize emin misiniz?`
      )
    ) {
      return;
    }
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "remove_team_member",
        {
          p_target_user_id: targetUserId,
        }
      );
      if (rpcError || (data as any)?.error) {
        alert((data as any)?.error || rpcError?.message || "Kullanıcı silinemedi");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== targetUserId));
    } catch (err) {
      console.error("Kullanıcı çıkarma hatası:", err);
    }
  };

  const renderRoleBadge = (r: string) => {
    switch (r) {
      case "admin":
        return (
          <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 gap-1 text-xs">
            <Shield className="w-3 h-3 text-indigo-400" /> Admin
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 gap-1 text-xs">
            <User className="w-3 h-3 text-emerald-400" /> Kullanıcı
          </Badge>
        );
      case "viewer":
        return (
          <Badge className="bg-slate-500/20 text-slate-300 border border-slate-500/30 gap-1 text-xs">
            Gözlemci
          </Badge>
        );
      default:
        return <Badge variant="outline">{r}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900/95 border border-slate-800 text-white shadow-2xl backdrop-blur-xl p-0 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Ekip & Yetki Yönetimi
                  </DialogTitle>
                  <DialogDescription className="text-indigo-100/80 text-xs">
                    {company?.name
                      ? `${company.name} şirketi için personelleri ve erişim izinlerini yönetin.`
                      : "Şirketiniz için personelleri ve izinleri yönetin."}
                  </DialogDescription>
                </div>
              </div>
              <Badge className="bg-white/15 text-white border border-white/20 text-xs px-2.5 py-1">
                {members.length} Üye
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              setActiveTab("list");
              setError(null);
            }}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> Mevcut Ekip Üyeleri
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("add");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "add"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Yeni Personel Ekle
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: MEMBERS LIST */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Kayıtlı Çalışanlar
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTeamMembers}
                  disabled={loading}
                  className="h-8 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 mr-1.5 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                  Yenile
                </Button>
              </div>

              {loading && members.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-sm">Ekip listesi yükleniyor...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl p-6">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">
                    Henüz eklenmiş bir personel bulunmuyor
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Üst menüden &quot;Yeni Personel Ekle&quot; sekmesine geçerek çalışan
                    ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {members.map((member) => {
                    const isSelf = member.id === userId;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                            {member.full_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white truncate">
                                {member.full_name}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                                  Sen
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {member.email || "E-posta gizli"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isSelf || member.role === "admin" ? (
                            renderRoleBadge(member.role)
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(val) =>
                                handleRoleChange(member.id, val)
                              }
                            >
                              <SelectTrigger className="w-32 h-8 text-xs bg-slate-900 border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="user">Kullanıcı</SelectItem>
                                <SelectItem value="viewer">Gözlemci</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {!isSelf && member.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveMember(member.id, member.full_name)
                              }
                              className="w-8 h-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Şirketten Çıkar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD MEMBER */}
          {activeTab === "add" && (
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-medium">
                  Çalışanın Adı Soyadı
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Örn: Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-medium">
                  E-posta Adresi
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="ahmet@sirketiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300 font-medium">
                    İlk Şifre
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="En az 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-300 font-medium">
                    Yetki Rolü
                  </Label>
                  <Select
                    value={role}
                    onValueChange={(val: any) => setRole(val)}
                  >
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="user">
                        Kullanıcı (Stok/Sayım İşlem Yetkisi)
                      </SelectItem>
                      <SelectItem value="viewer">
                        Gözlemci (Sadece Görüntüleme)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Personel Ekleniyor...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Personeli Kaydet ve Ekibe Dahil Et
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                Bu personel eklendiğinde doğrudan <b>{company?.name || "Şirketinize"}</b>{" "}
                bağlanır ve giriş yaptığında tüm şirket verilerini görüntüleyip
                işleyebilir.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
