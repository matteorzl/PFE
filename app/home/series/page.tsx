"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Card, Input, CardBody, CardFooter, Image, Breadcrumbs, BreadcrumbItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn} from "@heroui/react";
import { EditModal } from "@/components/category/EditModal";
import { DeleteModal } from "@/components/category/DeleteModal";
import { CreateModal } from "@/components/category/CreateModal"; // Ajoute cet import

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  created_by: number;
  is_free: number; 
  difficulty: string | number;
}

export const PlusIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height={24} width={24} {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

const StarsDifficulty = ({ difficulty }: { difficulty: string | number }) => {
  let yellow = 1;
  if (difficulty === "moyen" || difficulty === 2) yellow = 2;
  if (difficulty === "difficile" || difficulty === 3) yellow = 3;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill={i <= yellow ? "#FFD700" : "#fff"}
          stroke="#FFD700"
        >
          <polygon
            points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
            strokeWidth={i <= yellow ? 0 : 1}
          />
        </svg>
      ))}
    </div>
  );
};

const CrownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-6 h-6 text-yellow-500"
  >
    <path d="M8 22L20 38L32 20L44 38L56 22L50 48H14L8 22Z" fill="#FFD700" stroke="#C9A000" strokeWidth="2" strokeLinejoin="round" />
    <rect x="18" y="48" width="28" height="6" rx="1" fill="#C9A000" />
    <circle cx="8" cy="22" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
    <circle cx="32" cy="20" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
    <circle cx="56" cy="22" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
  </svg>
);

export const EditDocumentIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M15.48 3H7.52C4.07 3 2 5.06 2 8.52v7.95C2 19.94 4.07 22 7.52 22h7.95c3.46 0 5.52-2.06 5.52-5.52V8.52C21 5.06 18.93 3 15.48 3Z"
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M21.02 2.98c-1.79-1.8-3.54-1.84-5.38 0L14.51 4.1c-.1.1-.13.24-.09.37.7 2.45 2.66 4.41 5.11 5.11.03.01.08.01.11.01.1 0 .2-.04.27-.11l1.11-1.12c.91-.91 1.36-1.78 1.36-2.67 0-.9-.45-1.79-1.36-2.71ZM17.86 10.42c-.27-.13-.53-.26-.77-.41-.2-.12-.4-.25-.59-.39-.16-.1-.34-.25-.52-.4-.02-.01-.08-.06-.16-.14-.31-.25-.64-.59-.95-.96-.02-.02-.08-.08-.13-.17-.1-.11-.25-.3-.38-.51-.11-.14-.24-.34-.36-.55-.15-.25-.28-.5-.4-.76-.13-.28-.23-.54-.32-.79L7.9 10.72c-.35.35-.69 1.01-.76 1.5l-.43 2.98c-.09.63.08 1.22.47 1.61.33.33.78.5 1.28.5.11 0 .22-.01.33-.02l2.97-.42c.49-.07 1.15-.4 1.5-.76l5.38-5.38c-.25-.08-.5-.19-.78-.31Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const DeleteDocumentIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
        fill="currentColor"
      />
      <path
        d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
        fill="currentColor"
        opacity={0.399}
      />
      <path
        clipRule="evenodd"
        d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function SeriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchValue, setSearchValue] = useState(""); 
  const[isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Ajoute cet état
  const router = useRouter();
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  useEffect(() => {
    let filtered = [...categories];
    if (searchValue) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [searchValue, categories]);

  const handleCardClick = (categoryId: number, categoryName: string) => {
    const encodedName = encodeURIComponent(categoryName);
    router.push(`/home/series/${categoryId}?name=${encodedName}`);
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`http://localhost:3001/api/category/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    await fetchCategories(); // Pour rafraîchir la liste après suppression
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg"/>
      </div>
    );
  }

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push('/home')}>Tableau de bord</BreadcrumbItem>
        <BreadcrumbItem>Séries</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4 w-100 flex items-baseline gap-2 justify-between">
        <span className="flex items-baseline gap-2">
          Séries
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800">
            {categories.length}
          </span>
        </span>
        <Button 
          color="primary" 
          endContent={<PlusIcon />}
          size="sm"
          onPress={() => setIsCreateModalOpen(true)}
        >
          Créer une série
        </Button>
      </h1>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Rechercher une série..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="w-full max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            isPressable
            className="hover:scale-105 transition-transform cursor-pointer relative h-[200px] flex flex-col justify-end overflow-hidden"
            style={{
              backgroundImage: `url(${category.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: category.is_free === 0
                ? "5px solid rgba(255, 215, 0, 0.9)"
                : undefined,
              borderRadius: "0.5rem",
              boxShadow: category.is_free === 0
                ? "0 0 16px 4px rgba(255, 215, 0, 0.7), 0 2px 8px rgba(0,0,0,0.15)"
                : undefined,
            }}
            onPress={() => handleCardClick(category.id, category.name)}
          >
            {category.is_free === 0 && (
              <div className="absolute top-2 left-2 z-20">
                <CrownIcon />
              </div>
            )}
            {/* Dropdown en haut à droite */}
            <div className="absolute top-2 right-2 flex justify-end w-full z-10">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" className="text-2xl font-bold w-10 h-10 flex items-start justify-center p-0 text-white">...</Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    startContent={<EditDocumentIcon className={iconClasses} />}
                    onPress={() => {
                      setSelectedCategory(category);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Modifier
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />}
                    onPress={() => {
                      setSelectedCategory(category);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Supprimer
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            {/* Overlay pour lisibilité du texte */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="absolute bottom-12 z-30 flex items-center">
                <StarsDifficulty difficulty={category.difficulty} />
              </div>
              <h4
                className="text-white font-bold uppercase text-center drop-shadow-lg"
                style={{
                  fontSize: "clamp(3vw, 20%, 5vw)", // Taille responsive : minimum 1rem, maximum 2.5rem, 10% de l'espace disponible
                }}
              >
                {category.name}
              </h4>
            </div>
            <CardFooter className="flex flex-col items-center relative z-10">
              <p className="text-medium text-white">{category.description}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchCategories}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onEdit={fetchCategories}
        category={selectedCategory}
      />
      {selectedCategory && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}