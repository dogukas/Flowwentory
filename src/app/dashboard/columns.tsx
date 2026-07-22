import { ColumnDef } from "@tanstack/react-table";
import { StockItem } from "@/types/stock";

export const columns: ColumnDef<StockItem>[] = [
  {
    accessorKey: "Marka",
    header: "Marka",
  },
  {
    accessorKey: "Ürün Grubu",
    header: "Ürün Grubu",
  },
  {
    accessorKey: "Ürün Kodu",
    header: "Ürün Kodu",
  },
  {
    accessorKey: "Renk Kodu",
    header: "Renk Kodu",
  },
  {
    accessorKey: "Beden",
    header: "Beden",
  },
  {
    accessorKey: "Envanter",
    header: "Envanter",
  },
  {
    accessorKey: "Barkod",
    header: "Barkod",
  },
]; 