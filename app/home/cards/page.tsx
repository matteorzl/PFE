"use client";

import ColorThief from "color-thief-browser";
import { useEffect, useRef, useState } from "react";
import { Skeleton, Breadcrumbs, BreadcrumbItem, Input, Card, CardBody, Image, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import CreateModal from "@/components/card/CreateModal";
import { EditModal } from "@/components/card/EditModal";
import { DeleteModal } from "@/components/card/DeleteModal";
import { CustomAudioPlayer } from "@/components/CustomAudioPlayer";
import Cookies from "js-cookie";

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: number | null;
  order_list: number;
}

// Utilitaire pour déterminer si une couleur RGB est claire
function isColorLight(rgb: string): boolean {
  const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 180;
}

export const PlusIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height={24} width={24} {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export const ChevronDownIcon = () => (
  <svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
      fill="currentColor"
    />
  </svg>
);

export const EditDocumentIcon = (props: any) => (
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

export const DeleteDocumentIcon = (props: any) => (
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

const ValidateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const RefuseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const GifIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<CardItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [filteredCards, setFilteredCards] = useState<CardItem[]>([]);
  const [filterFree, setFilterFree] = useState<"all" | "free" | "paid">("all");
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tabsState, setTabsState] = useState<{ [cardId: number]: "image" | "gif" }>({});
  const [cardGradients, setCardGradients] = useState<{ [cardId: number]: string }>({});
  const [cardLightColors, setCardLightColors] = useState<{ [cardId: number]: string }>({});
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const router = useRouter();

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/cards");
      const data = await response.json();
      setCards(data);
      setFilteredCards(data);
      // Initialise le tab sur "image" pour chaque carte
      const initialTabs: { [cardId: number]: "image" | "gif" } = {};
      data.forEach((card: CardItem) => {
        initialTabs[card.id] = "image";
      });
      setTabsState(initialTabs);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (cardId: number, imgElement: HTMLImageElement) => {
    try {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(imgElement, 2);
      if (palette && palette.length >= 2) {
        // Trouve la couleur la plus claire (celle avec la plus grande somme r+g+b)
        const [c1, c2] = palette;
        const lightest = (c1[0] + c1[1] + c1[2]) > (c2[0] + c2[1] + c2[2]) ? c1 : c2;
        const gradient = `linear-gradient(135deg, rgb(${c1.join(",")}), rgb(${c2.join(",")}))`;
        setCardGradients(prev => ({ ...prev, [cardId]: gradient }));
        setCardLightColors(prev => ({ ...prev, [cardId]: `rgb(${lightest.join(",")})` }));
      }
    } catch (e) {
      setCardGradients(prev => ({ ...prev, [cardId]: "linear-gradient(135deg, #eee, #ccc)" }));
      setCardLightColors(prev => ({ ...prev, [cardId]: "#eee" }));
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    
    if (userCookie) {
      try {
        setCurrentUser(JSON.parse(userCookie));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
      
    let filtered = [...cards];

    if (searchValue) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (filterStatus === "validated") {
      filtered = filtered.filter((card) => card.is_validated === 1);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (card) => card.is_validated === null || card.is_validated === 0
      );
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter((card) => card.is_validated === 2);
    }

    setFilteredCards(filtered);
  }, [searchValue, filterStatus, filterFree, cards]);

  const handleValidateCard = async (cardId: number, is_validated: 1 | 2) => {
    await fetch(`http://localhost:3001/api/cards/${cardId}/validate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_validated }),
    });
    await fetchCards();
  };

  const handleTabClick = (cardId: number, tab: "image" | "gif") => {
    setTabsState((prev) => ({ ...prev, [cardId]: tab }));
  };

  const handleEditClick = (card: CardItem) => {
    setCardToEdit(card);
    setIsEditModalOpen(true);
  };

  const handleCardEdited = async () => {
    await fetchCards();
  };

  const handleDeleteClick = (card: CardItem) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const handleCardDeleted = async (id: number) => {
    await fetch(`http://localhost:3001/api/cards/${id}`, { method: "DELETE" });
    await fetchCards();
  };

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push("/home")}>
          Tableau de bord
        </BreadcrumbItem>
        <BreadcrumbItem>Cartes</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4 w-100 flex items-baseline gap-2 justify-between">
        <span className="flex items-baseline gap-2">
          Cartes
         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800 min-w-[32px] justify-center">
            {loading ? (
              <Skeleton className="h-8 rounded-full" />
            ) : (
              cards.length
            )}
          </span>
        </span>
        <Button 
          color="primary" 
          endContent={<PlusIcon />}
          size="sm"
          onPress={() => setIsCreateModalOpen(true)}
        >
          Créer une carte
        </Button>
      </h1>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Rechercher une carte..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="w-full max-w-md"
        />
        <div className="flex gap-4">
          <div>
            Statut
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="ml-4">
                  {filterStatus === "all"
                    ? "Tous"
                    : filterStatus === "validated"
                    ? "Validé"
                    : filterStatus === "pending"
                    ? "En attente"
                    : "Refusé"}
                  <ChevronDownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="all" onClick={() => setFilterStatus("all")}>
                  Tous
                </DropdownItem>
                <DropdownItem key="validated" onClick={() => setFilterStatus("validated")}>
                  Validé
                </DropdownItem>
                <DropdownItem key="pending" onClick={() => setFilterStatus("pending")}>
                  En attente
                </DropdownItem>
                <DropdownItem key="rejected" onClick={() => setFilterStatus("rejected")}>
                  Refusé
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            Type
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="ml-4">
                  {filterFree === "all"
                    ? "Tous"
                    : filterFree === "free"
                    ? "Gratuit"
                    : "Premium"}
                  <ChevronDownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="all" onClick={() => setFilterFree("all")}>
                  Tous
                </DropdownItem>
                <DropdownItem key="free" onClick={() => setFilterFree("free")}>
                  Gratuit
                </DropdownItem>
                <DropdownItem key="paid" onClick={() => setFilterFree("paid")}>
                  Premium
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
            ))
          : filteredCards.map((card) => {
            const lightColor = cardLightColors[card.id] || "#eee";
            const textColor = isColorLight(lightColor) ? "#222" : "#fff";
            return (
              <Card
                key={card.id}
                isBlurred
                style={{
                  background: cardGradients[card.id] || "linear-gradient(135deg, #eee, #ccc)",
                  color: textColor,
                }}
                className="border-none bg-background/60 dark:bg-default-100/50 max-w-[600px] cursor-pointer relative"
                shadow="sm"
              >
                {/* Dropdown en haut à droite */}
                <div 
                  className="absolute top-2 right-2 flex justify-end w-full z-10"
                >
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="light"
                        className="text-2xl font-bold w-10 h-10 flex items-start justify-center p-0"
                        style={{ color: textColor }}
                      >...</Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        startContent={<EditDocumentIcon />}
                        onClick={() => handleEditClick(card)}
                      >
                        Modifier
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<DeleteDocumentIcon />}
                        onClick={() => handleDeleteClick(card)}
                      >
                        Supprimer
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <CardBody>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                    <div className="relative col-span-6 md:col-span-4 flex flex-col items-center">
                      <img
                        src={
                          tabsState[card.id] === "gif"
                            ? `http://localhost:3001/api/cards/${card.id}/animation`
                            : `http://localhost:3001/api/cards/${card.id}/image`
                        }
                        alt=""
                        crossOrigin="anonymous"
                        style={{ display: "none" }}
                        onLoad={e => handleImageLoad(card.id, e.currentTarget)}
                      />
                      <Image
                        alt={`Image de ${card.name}`}
                        className="object-cover"
                        height={150}
                        shadow="md"
                        src={
                          tabsState[card.id] === "gif"
                            ? `http://localhost:3001/api/cards/${card.id}/animation`
                            : `http://localhost:3001/api/cards/${card.id}/image`
                        }
                        width="100%"
                      />
                      <div className="flex gap-2 mt-2 justify-center">
                        <Button
                          type="button"
                          isIconOnly
                          className={`p-2 rounded-full border transition
                            ${tabsState[card.id] !== "gif"
                              ? " text-blue-600"
                              : "bg-transparent border-transparent"}
                          `}
                          title="Voir l'image"
                          onPress={() => handleTabClick(card.id, "image")}
                          style={{
                            color: tabsState[card.id] === "image"
                              ? undefined
                              : lightColor
                          }}
                        >
                          <ImageIcon />
                        </Button>
                        <Button
                          type="button"
                          isIconOnly
                          className={`p-2 rounded-full border transition
                            ${tabsState[card.id] === "gif"
                              ? " text-blue-600"
                              : "bg-transparent border-transparent"}
                          `}
                          title="Voir le GIF"
                          onPress={() => handleTabClick(card.id, "gif")}
                          style={{
                            color: tabsState[card.id] === "gif"
                              ? undefined
                              : lightColor
                          }}
                        >
                          <GifIcon />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col col-span-6 md:col-span-8">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-semibold"
                              style={{ color: textColor }}
                            >
                            {card.name}
                            </h3>
                            {card.is_validated === 1 ? (
                              <div title="Validé par l'administrateur">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5 text-green-500"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                  />
                                </svg>
                              </div>
                            ) : card.is_validated === 2 ? (
                              <div title="Refusé par l'administrateur">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5 text-red-500"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div title="En attente de validation par l'administrateur">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5 text-yellow-500"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center w-full mt-2">
                        <div className="w-full">
                          <CustomAudioPlayer 
                            src={`http://localhost:3001/api/cards/${card.id}/sound`} 
                            color={textColor}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-2 min-h-[44px]">
                          {currentUser?.role === "admin" && (card.is_validated === 0 || card.is_validated === null) && (
                            <>
                              <Button
                                title="Valider"
                                className="rounded-full bg-green-100/50 hover:bg-green-200 transition"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleValidateCard(card.id, 1);
                                }}
                              >
                                <ValidateIcon />
                              </Button>
                              <Button
                                title="Refuser"
                                className="rounded-full bg-red-100/50 hover:bg-red-200 transition"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleValidateCard(card.id, 2);
                                }}
                              >
                                <RefuseIcon />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        }
      </div>
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchCards}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleCardEdited}
        card={cardToEdit}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        card={cardToDelete}
        onDelete={handleCardDeleted}
      />
    </div>
  );
}