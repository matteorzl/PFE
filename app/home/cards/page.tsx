"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs, BreadcrumbItem, Input, Card, CardBody, Image, Button, Slider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { useRouter } from "next/navigation";

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: boolean | null;
  is_free: boolean | null;
  order_list: number;
}

export const PlusIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height={24} width={24} {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export const ChevronDownIcon = () => {
    return (
      <svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
          fill="currentColor"
        />
      </svg>
    );
  };

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

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch("http://localhost:3001/api/cards");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cartes");
        }
        const data = await response.json();
        setCards(data);
        setFilteredCards(data); // Initialisation des cartes filtrées
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  useEffect(() => {
    let filtered = [...cards];

    // Filtrage par recherche
    if (searchValue) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus === "validated") {
      filtered = filtered.filter((card) => card.is_validated === true);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (card) => card.is_validated === null || card.is_validated === undefined
      );
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter((card) => card.is_validated === false);
    }

    setFilteredCards(filtered);
  }, [searchValue, filterStatus, cards]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push("/home")}>
          Tableau de bord
        </BreadcrumbItem>
        <BreadcrumbItem>Cartes</BreadcrumbItem>
      </Breadcrumbs>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cartes</h1>
        <Button 
          color="primary" 
          endContent={<PlusIcon />}
          size="sm"
          onPress={() => router.push('/home/cards/create')}
        >
          Créer une carte
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Rechercher une carte..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="w-full max-w-md"
        />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 max-w-[600px] cursor-pointer relative"
            shadow="sm"
          >
            {/* Dropdown en haut à droite */}
            <div className="absolute top-2 right-2 flex justify-end w-full z-10">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" className="text-2xl font-bold w-10 h-10 flex items-start justify-center p-0">...</Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    startContent={<EditDocumentIcon />}
                    onClick={() => router.push(`/home/cards/edit/${card.id}`)}
                  >
                    Modifier
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<DeleteDocumentIcon />}
                  >
                    Supprimer
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <CardBody>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                <div className="relative col-span-6 md:col-span-4">
                  <Image
                    alt={`Image de ${card.name}`}
                    className="object-cover"
                    height={150}
                    shadow="md"
                    src="/placeholder-image.png"
                    width="100%"
                  />
                </div>

                <div className="flex flex-col col-span-6 md:col-span-8">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground/90">{card.name}</h3>
                        {card.is_validated ? (
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
                        ) : card.is_validated === false ? (
                          <div className="ml-2" title="Refusé par l'administrateur">
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
                          <div className="ml-2" title="En attente de validation par l'administrateur">
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
                      <div className="flex items-center gap-2 py-2 text-small text-foreground/80">
                        {card.is_free ? (
                            <div
                            className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 rounded-full text-green-500 font-bold text-sm"
                            title="Gratuit"
                            >
                            <span>Gratuit</span>
                            </div>
                        ) : (
                            <div
                            className="flex items-center gap-2 px-4 py-2 border-2 border-yellow-500 rounded-full text-yellow-500 font-bold text-sm"
                            title="Premium"
                            >
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
                            <span>Premium</span>
                            </div>
                        )}
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col mt-3 gap-1">
                    <Slider
                      aria-label="Progression audio"
                      classNames={{
                        track: "bg-default-500/30",
                        thumb: "w-2 h-2 after:w-2 after:h-2 after:bg-foreground",
                      }}
                      color="foreground"
                      defaultValue={0}
                      size="sm"
                    />
                    <div className="flex justify-between">
                      <p className="text-small">0:00</p>
                      <p className="text-small text-foreground/50">Durée</p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-center mt-4">
                    <Button
                      isIconOnly
                      className="data-[hover]:bg-foreground/10"
                      radius="full"
                      variant="light"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 text-foreground/80"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5v15l11-7.5-11-7.5z"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}