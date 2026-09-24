import { useState, useMemo } from "react";
import type { Product } from "../context/BusinessContext";

export function useProductSearch(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch = 
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query)) ||
        (() => {
          if (!p.customFields) return false;
          try {
            const parsed = JSON.parse(p.customFields);
            return Object.values(parsed).some(v => 
              String(v).toLowerCase().includes(query)
            );
          } catch (e) {
            return false;
          }
        })();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
  };
}
