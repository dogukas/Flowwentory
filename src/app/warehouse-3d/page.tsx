"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    Text,
    Environment,
    Float,
    useCursor,
    PointerLockControls
} from "@react-three/drei";
import { useStockStore } from "@/store/useStockStore";
import { useRetailBrainStore } from "@/store/useRetailBrainStore";
import { useLayoutEffect, useRef, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Search,
    Thermometer,
    Target,
    MousePointer2,
    Box as BoxIcon,
    Truck,
    CheckCircle2,
    Navigation,
    ArrowLeftRight,
} from "lucide-react";

// Types
interface BoxProps {
    position: [number, number, number];
    color: string;
    item: any;
    onClick: (item: any) => void;
    index: number;
    isHighlighted: boolean;
    opacity: number;
}

const ProductBox = ({ position, color, item, onClick, index, isHighlighted, opacity }: BoxProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    // Staggered entrance animation
    useLayoutEffect(() => {
        if (meshRef.current) {
            meshRef.current.scale.set(0, 0, 0);
            gsap.to(meshRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                delay: index * 0.05 + Math.random() * 0.5
            });
        }
    }, [index]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Hover animation or Spotlight pulse
        if (hovered || (isHighlighted && opacity === 1)) {
            meshRef.current.rotation.y += 0.02;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        } else {
            // Return to original pos smoothly
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick(item);
                // "Drone pick" animation effect
                if (meshRef.current) {
                    gsap.to(meshRef.current.position, { y: position[1] + 2, duration: 0.5, yoyo: true, repeat: 1 });
                }
            }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial
                color={hovered ? "#ffffff" : color}
                roughness={0.2}
                metalness={0.1}
                emissive={isHighlighted ? color : "#000000"}
                emissiveIntensity={isHighlighted ? 0.8 : (hovered ? 0.5 : 0)}
                transparent
                opacity={opacity}
            />
        </mesh>
    );
};

const Shelf = ({ position, items, brandName, onClickItem, heatmapMode, searchQuery, abcMode }: {
    position: [number, number, number],
    items: any[],
    brandName: string,
    onClickItem: (item: any) => void,
    heatmapMode: boolean,
    searchQuery: string,
    abcMode: boolean
}) => {
    const itemsPerRow = 5;

    return (
        <group position={position}>
            {/* Shelf Structure */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[5, 0.2, 2]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            <mesh position={[0, 2, -1]} receiveShadow>
                <boxGeometry args={[5, 5, 0.1]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>

            {/* Brand Label */}
            <Text
                position={[0, 4.8, -1]}
                rotation={[0, 0, 0]}
                fontSize={0.6}
                color="white"
                anchorX="center"
                maxWidth={4}
            >
                {brandName}
            </Text>

            {/* Floor Marking */}
            <group position={[0, -0.59, 2]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[5, 0.2]} />
                    <meshBasicMaterial color="#fbbf24" />
                </mesh>
                <Text
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0.01, 0.4]}
                    fontSize={0.3}
                    color="#94a3b8"
                >
                    ZONE {brandName.substring(0, 3).toUpperCase()}
                </Text>
            </group>

            {/* Product Boxes */}
            {items.map((item, i) => {
                if (i > 9) return null; // Limit items for demo performance

                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;

                // Color Logic
                let color = "#ffffff";

                if (heatmapMode) {
                    const count = parseInt(item.Envanter) || 0;
                    if (count <= 0) color = "#3b82f6"; // Blue = Dead/Zero
                    else if (count < 10) color = "#ef4444"; // Red = Low
                    else if (count < 50) color = "#eab308"; // Yellow = Medium
                    else color = "#22c55e"; // Green = High
                } else if (abcMode) {
                    // Mock ABC Logic
                    // A = Green (Fast), B = Yellow, C = Red
                    // Randomly assign for demo based on index or hash
                    const val = (i + brandName.length) % 3;
                    if (val === 0) color = "#22c55e"; // A
                    else if (val === 1) color = "#eab308"; // B
                    else color = "#ef4444"; // C
                } else {
                    const colorString = typeof item["Renk Kodu"] === 'string' ? item["Renk Kodu"] : 'Unknown';
                    const colorHash = colorString.split('').reduce((acc: number, char: string, i: number) => acc + char.charCodeAt(0) * (i + 1), 0);
                    const hue = colorHash % 360;
                    color = `hsl(${hue}, 70%, 50%)`;
                }

                // Spotlight Logic
                let isHighlighted = true;
                let opacity = 1;

                if (searchQuery && searchQuery.length > 1) {
                    const query = searchQuery.toLowerCase();
                    const match =
                        item.Marka.toLowerCase().includes(query) ||
                        (item["Ürün Grubu"] && item["Ürün Grubu"].toLowerCase().includes(query)) ||
                        (item["Ürün Kodu"] && item["Ürün Kodu"].toLowerCase().includes(query));

                    if (match) {
                        isHighlighted = true;
                        opacity = 1;
                    } else {
                        isHighlighted = false;
                        opacity = 0.1;
                    }
                }

                return (
                    <ProductBox
                        key={i}
                        index={i}
                        position={[
                            (col * 0.9) - 1.8,
                            0.4 + (row * 0.9),
                            (row > 1 ? -0.5 : 0.5)
                        ]}
                        color={color}
                        item={item}
                        onClick={onClickItem}
                        isHighlighted={isHighlighted}
                        opacity={opacity}
                    />
                );
            })}
        </group>
    );
};

const WarehouseScene = ({
    onSelectItem,
    heatmapMode,
    searchQuery,
    abcMode
}: {
    onSelectItem: (item: any) => void,
    heatmapMode: boolean,
    searchQuery: string,
    abcMode: boolean
}) => {
    const stockData = useStockStore((state) => state.stockData);

    // Calculate groups
    const { brandGroups } = useMemo(() => {
        const safeData = Array.isArray(stockData) ? stockData : [];
        const grouped: Record<string, any[]> = {};
        safeData.forEach(item => {
            if (!item || !item.Marka) return;
            if (!grouped[item.Marka]) grouped[item.Marka] = [];
            grouped[item.Marka].push(item);
        });

        const groups = Object.entries(grouped)
            .map(([brand, items]) => ({ brand, items }))
            .sort((a, b) => b.items.length - a.items.length)
            .slice(0, 16);

        return { brandGroups: groups };
    }, [stockData]);

    const groupRef = useRef<THREE.Group>(null);

    // Entrance
    useLayoutEffect(() => {
        if (groupRef.current) {
            gsap.from(groupRef.current.rotation, {
                y: Math.PI,
                duration: 2,
                ease: "power3.out"
            });
        }
    }, []);

    return (
        <group ref={groupRef}>
            {brandGroups.map((group, i) => {
                const shelvesPerRow = 4;
                const row = Math.floor(i / shelvesPerRow);
                const col = i % shelvesPerRow;

                return (
                    <Shelf
                        key={group.brand}
                        brandName={group.brand}
                        items={group.items}
                        position={[
                            (col - 1.5) * 8,
                            0,
                            (row - 1.5) * 8
                        ]}
                        onClickItem={onSelectItem}
                        heatmapMode={heatmapMode}
                        searchQuery={searchQuery}
                        abcMode={abcMode}
                    />
                );
            })}

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
                <gridHelper args={[100, 50, 0x1e293b, 0x1e293b]} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>

            {/* Ambient particles */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[5, 5, 0]}>
                    <icosahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} />
                </mesh>
            </Float>
        </group>
    );
};

// --- Pathfinding Component ---
const PickingPath = ({ points }: { points: THREE.Vector3[] }) => {
    const curve = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    }, [points]);

    if (!curve) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, 0.1, 8, false]} />
            <meshStandardMaterial color="#f472b6" emissive="#be185d" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
    );
};

// --- Main Component ---

export default function Warehouse3D() {
    const stockData = useStockStore((state) => state.stockData);
    const setStockData = useStockStore((state) => state.setStockData);
    const { pickingQueue, markPickingComplete } = useRetailBrainStore();

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [heatmapMode, setHeatmapMode] = useState(false);
    const [abcMode, setAbcMode] = useState(false);
    const [viewMode, setViewMode] = useState<"orbit" | "fps">("orbit");
    const [activePath, setActivePath] = useState<THREE.Vector3[]>([]);
    const [mobileHud, setMobileHud] = useState<"3d" | "controls" | "picking">("3d");

    useEffect(() => {
        const loadStocksIfEmpty = async () => {
            if (stockData && stockData.length > 0) return;
            try {
                const { fetchAllRows } = await import("@/lib/supabase");
                const stocks = await fetchAllRows("stocks");
                if (stocks && stocks.length > 0) {
                    const formatted = stocks.map((item: any) => ({
                        Marka: item.marka,
                        "Ürün Grubu": item.urun_grubu,
                        "Ürün Kodu": item.urun_kodu,
                        "Renk Kodu": item.renk_kodu,
                        Beden: item.beden,
                        Envanter: item.envanter,
                        Barkod: item.barkod,
                        Sezon: item.sezon,
                    }));
                    setStockData(formatted);
                }
            } catch (err) {
                console.error("3D Depo veri yükleme hatası:", err);
            }
        };
        loadStocksIfEmpty();
    }, [stockData, setStockData]);

    // Marka raflarının 3D koordinat haritası (RPT onaylı ürünlerin gerçek raflarına rota çizmek için)
    const brandShelfCoords = useMemo(() => {
        const safeData = Array.isArray(stockData) ? stockData : [];
        const grouped: Record<string, any[]> = {};
        safeData.forEach(item => {
            if (!item || !item.Marka) return;
            if (!grouped[item.Marka]) grouped[item.Marka] = [];
            grouped[item.Marka].push(item);
        });
        const sortedBrands = Object.entries(grouped)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 16)
            .map(([brand]) => brand);

        const coords: Record<string, THREE.Vector3> = {};
        sortedBrands.forEach((brand, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            coords[brand] = new THREE.Vector3((col - 1.5) * 8, 1.5, (row - 1.5) * 8 + 1.5);
        });
        return coords;
    }, [stockData]);

    // Simulate Picking Path (Önce RPT/Transfer kuyruğundaki gerçek raflara, yoksa örnek raflara rota çizer)
    const simulatePath = () => {
        const safeData = Array.isArray(stockData) ? stockData : [];
        if (safeData.length === 0) return;

        const pendingTasks = pickingQueue.filter(t => t.status === "PENDING");
        const points: THREE.Vector3[] = [];

        if (pendingTasks.length > 0) {
            pendingTasks.forEach((task) => {
                const shelfVec = brandShelfCoords[task.brand];
                if (shelfVec) {
                    points.push(shelfVec.clone());
                } else {
                    points.push(new THREE.Vector3((Math.random() * 20) - 10, 1.5, (Math.random() * 20) - 10));
                }
            });
        } else {
            for (let i = 0; i < 5; i++) {
                points.push(new THREE.Vector3(
                    (Math.random() * 24) - 12,
                    1.5,
                    (Math.random() * 24) - 12
                ));
            }
        }

        // En yakın komşu (TSP) algoritması ile en kısa toplama rotası
        const sortedPoints = [new THREE.Vector3(0, 0.5, 16)]; // Sevkiyat Kapısı başlangıcı
        const remaining = [...points];

        while (remaining.length > 0) {
            const current = sortedPoints[sortedPoints.length - 1];
            let nearestIndex = 0;
            let minDist = Infinity;

            remaining.forEach((p, i) => {
                const dist = current.distanceTo(p);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIndex = i;
                }
            });

            sortedPoints.push(remaining[nearestIndex]);
            remaining.splice(nearestIndex, 1);
        }

        sortedPoints.push(new THREE.Vector3(0, 0.5, 16));
        setActivePath(sortedPoints);
    };

    const pendingTasks = pickingQueue.filter((t) => t.status === "PENDING");

    return (
        <div className="h-[calc(100vh-56px)] md:h-screen w-full bg-slate-950 relative overflow-hidden">
            {/* Mobile Top Switcher Bar (Prevents HUD Overlap on Phones) */}
            <div className="md:hidden absolute top-4 left-16 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-xl">
                <button
                    type="button"
                    onClick={() => setMobileHud("3d")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        mobileHud === "3d"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-300 hover:text-white"
                    }`}
                >
                    3D Sahne
                </button>
                <button
                    type="button"
                    onClick={() => setMobileHud(mobileHud === "controls" ? "3d" : "controls")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        mobileHud === "controls"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-300 hover:text-white"
                    }`}
                >
                    Kontroller
                </button>
                <button
                    type="button"
                    onClick={() => setMobileHud(mobileHud === "picking" ? "3d" : "picking")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        mobileHud === "picking"
                            ? "bg-emerald-600 text-white shadow"
                            : "text-slate-300 hover:text-white"
                    }`}
                >
                    <span>Picking</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px]">
                        {pendingTasks.length}
                    </span>
                </button>
            </div>

            {/* HUD & Controls */}
            <div
                className={`absolute top-16 md:top-4 left-3 right-3 md:left-16 md:right-auto z-10 flex flex-col gap-4 md:w-80 transition-all ${
                    mobileHud === "controls" ? "block" : "hidden md:flex"
                }`}
            >
                <Card className="p-4 bg-slate-900/90 md:bg-slate-900/80 border-slate-800 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <BoxIcon className="w-6 h-6 text-indigo-500" />
                            <h1 className="text-base md:text-lg font-bold text-white">3D Depo İkizi</h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileHud("3d")}
                            className="md:hidden text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                        >
                            Gizle
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Ürün Ara..."
                                className="pl-9 bg-slate-800 border-slate-700 text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Thermometer className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-slate-300">Stok Isı Haritası</span>
                                </div>
                                <Switch checked={heatmapMode} onCheckedChange={(c) => {
                                    setHeatmapMode(c);
                                    if (c) setAbcMode(false);
                                }} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Target className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-slate-300">ABC Analizi</span>
                                </div>
                                <Switch checked={abcMode} onCheckedChange={(c) => {
                                    setAbcMode(c);
                                    if (c) {
                                        setHeatmapMode(false);
                                        setSearchQuery("");
                                    }
                                }} />
                            </div>
                            <div className="hidden md:flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <MousePointer2 className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-slate-300">FPS Modu (WASD)</span>
                                </div>
                                <Switch checked={viewMode === 'fps'} onCheckedChange={(c) => setViewMode(c ? 'fps' : 'orbit')} />
                            </div>
                        </div>

                        {/* Actions */}
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 text-xs sm:text-sm"
                            onClick={() => {
                                simulatePath();
                                setMobileHud("3d");
                            }}
                        >
                            <Navigation className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                                {pendingTasks.length > 0
                                    ? `Sevkiyat Rotasını Çiz (${pendingTasks.length} Emir)`
                                    : "🚀 Örnek Toplama Rotası Çiz"}
                            </span>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* SAĞ ÜST: RPT & ŞUBE TRANSFER TOPLAMA LİSTESİ (PICKING QUEUE) */}
            <div
                className={`absolute top-16 md:top-4 left-3 right-3 md:left-auto md:right-4 z-10 md:w-84 md:max-w-[340px] ${
                    mobileHud === "picking" ? "block" : "hidden md:block"
                }`}
            >
                <Card className="p-4 bg-slate-900/90 md:bg-slate-900/85 border-slate-800 backdrop-blur-md text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-bold">Depo Toplama Listesi (Picking)</h2>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                            {pendingTasks.length} Bekleyen
                        </Badge>
                    </div>

                    {pendingTasks.length === 0 ? (
                        <div className="text-xs text-slate-400 py-3 space-y-2">
                            <p>RPT Planlama veya Şube Transfer ekranında onayladığınız siparişler otomatik olarak buraya düşer.</p>
                            <Link
                                href="/operations/planning"
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                                RPT Planlama Merkezine Git →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {pendingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => setSearchQuery(task.sku)}
                                    className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between gap-2"
                                >
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs font-bold text-indigo-400">
                                                {task.sku}
                                            </span>
                                            <Badge className="bg-white/10 text-slate-200 text-[9px] px-1.5 py-0">
                                                {task.sourceType === "STORE_TRANSFER" ? "İç Transfer" : "RPT"}
                                            </Badge>
                                        </div>
                                        <div className="text-[11px] text-slate-300 font-medium">
                                            {task.brand} • +{task.quantity} Adet
                                        </div>
                                        {task.targetStore && (
                                            <div className="text-[10px] text-slate-400 truncate">
                                                Hedef: {task.targetStore}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markPickingComplete(task.id);
                                        }}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shrink-0"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        Toplandı
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* 3D Canvas */}
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [10, 10, 10], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[15, 20, 15]} intensity={1.2} castShadow />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                {viewMode === 'orbit' ? (
                    <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} />
                ) : (
                    <PointerLockControls selector="#canvas-container" />
                )}

                {/* Interactive Scene */}
                <WarehouseScene
                    onSelectItem={setSelectedItem}
                    heatmapMode={heatmapMode}
                    searchQuery={searchQuery}
                    abcMode={abcMode}
                />

                {/* Path Visualization */}
                {activePath.length > 0 && <PickingPath points={activePath} />}

            </Canvas>

            {/* Item Detail Overlay */}
            {selectedItem && (
                <div className="absolute bottom-4 md:bottom-10 left-3 right-3 md:left-auto md:right-10 z-20 md:w-80">
                    <Card className="bg-slate-900/95 border-slate-700 text-white p-4 md:p-6 backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-indigo-400">{selectedItem.Marka}</h2>
                                <p className="text-sm text-slate-400">{selectedItem["Ürün Kodu"]}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Stok Adedi</p>
                                <p className="text-2xl font-bold">{selectedItem.Envanter}</p>
                            </div>
                            <div className="p-3 bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-400">Konum</p>
                                <p className="text-xl font-bold">A1-04</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full"
                                    style={{ width: `${Math.min(parseInt(selectedItem.Envanter), 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-right mt-1 text-slate-500">Raf Doluluk %</p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
