"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Breadcrumbs,
  BreadcrumbItem,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/user/CreateModal";
import { EditModal } from "@/components/user/EditModal";
import { DeleteModal } from "@/components/user/DeleteModal";
import { OrderCategoriesUserModal } from "@/components/user/OrderCategoriesUserModal";
import { ValidateModal } from "@/components/user/validateModal";
import { TherapistInfoModal } from "@/components/user/TherapistInfoModal";
import Cookies from "js-cookie";

export const PlusIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height={24} width={24} {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export const ChevronDownIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" width="1em" viewBox="0 0 24 24" {...props}>
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
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

export const SearchIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" width="1em" viewBox="0 0 24 24" {...props}>
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const EyeIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const DeleteIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const EditIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

export const CheckIcon = ({size, height, width, ...props}) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Open = ({size, height, width, ...props}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
};


const statusColorMap = {
  admin: "danger",
  patient: "primary",
  therapist: "warning",
};

const statusOptions = [
  { name: "Admin", uid: "admin" },
  { name: "Patient", uid: "patient" },
  { name: "Orthophoniste", uid: "therapist" },
];

const columns = [
  { name: "NOM", uid: "lastname", sortable: true },
  { name: "PRÉNOM", uid: "firstname", sortable: true },
  { name: "EMAIL", uid: "mail", sortable: true },
  { name: "PAYS", uid: "country", sortable: true },
  { name: "VILLE", uid: "city", sortable: true },
  { name: "RÔLE", uid: "role", sortable: true },
  { name: "VALIDATION", uid: "validation" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["lastname", "firstname", "mail", "role", "validation", "actions"];

type User = {
  id: string;
  firstname: string;
  lastname: string;
  mail: string;
  country: string;
  city: string;
  role: string;
  is_validated: number | null;
  is_accepted: number | null;
  therapist_id?: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [isOrderCategoriesModalOpen, setIsOrderCategoriesModalOpen] = useState(false);
  const [userForOrderCategories, setUserForOrderCategories] = useState<User | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [userForValidation, setUserForValidation] = useState<User | null>(null);
  const [isTherapistInfoModalOpen, setIsTherapistInfoModalOpen] = useState(false);
  const [userForTherapistInfo, setUserForTherapistInfo] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Filtres et colonnes
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(new Set(["all"]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));

  // Recherche et filtres
  const hasSearchFilter = Boolean(filterValue);

  const handleDeleteUser = async (id: string, role: string) => {
    const res = await fetch(`http://localhost:3001/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedUser: { role } }),
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    await fetchUsers();
  };

  const handleValidateTherapist = async (id: string, is_validated: number) => {
    const token = Cookies.get("token");
    const res = await fetch(`http://localhost:3001/api/therapist/${id}/validate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_validated }),
    });
    if (!res.ok) throw new Error("Erreur lors de la validation");
    await fetchUsers();
  };

  const handleOpenValidateModal = (user: User) => {
    setUserForValidation(user);
    setIsValidateModalOpen(true);
  };
  const handleCloseValidateModal = () => {
    setIsValidateModalOpen(false);
    setUserForValidation(null);
  };
  const handleValidate = async () => {
    if (userForValidation && userForValidation.role === "therapist") {
      await handleValidateTherapist(userForValidation.id, 1);
      handleCloseValidateModal();
    }
    if (userForValidation && userForValidation.role === "patient") {
      await handleValidatePatient(userForValidation.id, 1);
      handleCloseValidateModal();
    }
  };
  const handleRefuse = async () => {
    if (userForValidation && userForValidation.role === "therapist") {
      await handleValidateTherapist(userForValidation.id, 2);
      handleCloseValidateModal();
    }
    if (userForValidation && userForValidation.role === "patient") {
      await handleValidatePatient(userForValidation.id, 2);
      handleCloseValidateModal();
    }
  };

  // Ajout de la validation des patients pour les thérapeutes
  const handleValidatePatient = async (id: string, is_accepted: number) => {
    const token = Cookies.get("token");
    console.log('ID:', id);
    const res = await fetch(`http://localhost:3001/api/validate/patient/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_accepted }),
    });
    if (!res.ok) throw new Error("Erreur lors de la validation du patient");
    await fetchUsers();
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  // Filtrage des utilisateurs selon le rôle connecté
  const filteredItems = useMemo(() => {
    let filtered = [...rows];
    if (hasSearchFilter) {
      filtered = filtered.filter(
        (user) =>
          user.firstname.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.lastname.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.mail.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (!statusFilter.has("all")) {
      filtered = filtered.filter((user) => statusFilter.has(user.role));
    }
    if (currentUser?.role === "therapist") {
      filtered = filtered.filter(
        (user) => user.role === "patient" && user.therapist_id === currentUser.therapistId
      );
    }
    return filtered;
  }, [rows, filterValue, statusFilter, currentUser]);

  // Rendu des cellules
  const renderCell = useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "role":
        return (
          <Chip color={statusColorMap[cellValue as keyof typeof statusColorMap]} variant="flat" size="sm" className="capitalize">
            {cellValue}
          </Chip>
        );
      case "validation":
        if (user.role === "therapist") {
          const isValidated = user.is_validated;
          if (isValidated === null) {
            return (
              <div className="flex items-center gap-2">
                <Chip
                  color="warning"
                  startContent={<div>⌛</div>}
                  variant="flat"
                  size="sm"
                  className="capitalize"
                >
                  En attente
                </Chip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  color="primary"
                  aria-label="Valider"
                  onPress={() => handleOpenValidateModal(user)}
                >
                  <Open />
                </Button>
              </div>
            );
          } else if (isValidated === 1) {
            return (
              <Chip
                color="success"
                startContent={<CheckIcon size={18} />}
                variant="flat"
                size="sm"
                className="capitalize"
              >
                Validé
              </Chip>
            );
          } else if (isValidated === 2) {
            return (
              <Chip
                color="danger"
              startContent={<div>❌</div>}
                variant="flat"
                size="sm"
                className="capitalize"
              >
                Refusé
              </Chip>
            );
          }
        }
        // Validation des patients par le thérapeute
        if (user.role === "patient" && currentUser?.role === "therapist") {
          const isAccepted = user.is_accepted;
          if (isAccepted === null) {
            return (
              <div className="flex items-center gap-2">
                <Chip
                  color="warning"
                  startContent={<div>⌛</div>}
                  variant="flat"
                  size="sm"
                  className="capitalize"
                >
                  En attente
                </Chip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  color="primary"
                  aria-label="Valider"
                  onPress={() => handleOpenValidateModal(user)}
                >
                  <Open />
                </Button>
              </div>
            );
          } else if (isAccepted === 1) {
            return (
              <Chip
                color="success"
                startContent={<CheckIcon size={18} />}
                variant="flat"
                size="sm"
                className="capitalize"
              >
                Validé
              </Chip>
            );
          } else if (isAccepted === 2) {
            return (
              <Chip
                color="danger"
                startContent={<div>❌</div>}
                variant="flat"
                size="sm"
                className="capitalize"
              >
                Refusé
              </Chip>
            );
          }
        }
        return null;
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            {user.role === "patient" && (
              <Tooltip content="Voir les séries de l'utilisateur">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => {
                    setUserForOrderCategories(user);
                    setIsOrderCategoriesModalOpen(true);
                  }}
                >
                  <EyeIcon />
                </span>
              </Tooltip>
            )}
            {user.role === "therapist" && (
              <Tooltip content="Voir les informations du thérapeute">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => {
                    setUserForTherapistInfo(user);
                    setIsTherapistInfoModalOpen(true);
                  }}
                >
                  <EyeIcon />
                </span>
              </Tooltip>
            )}
            <Tooltip content="Modifier">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setSelectedUser(user);
                  setIsEditModalOpen(true);
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Supprimer">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => {
                  setSelectedUser(user);
                  setIsDeleteModalOpen(true);
                }}
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [currentUser]);
  const fetchUsers = async () => {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:3001/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRows(data);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le cookie (ou API si besoin)
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
  }, []);

  // Top content (barre de recherche, filtres, colonnes, bouton add)
  const topContent = (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Rechercher par nom, prénom ou email..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Statut
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtrer par rôle"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              <DropdownItem key="all" className="capitalize">Tous</DropdownItem>
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {status.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Colonnes
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Colonnes du tableau"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {column.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {currentUser?.role !== "therapist" && (
            <Button
              color="primary" 
              endContent={<PlusIcon />}
              size="sm"
              onPress={() => setIsCreateModalOpen(true)}
            >
              Ajouter un utilisateur
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push('/home')}>Tableau de bord</BreadcrumbItem>
        <BreadcrumbItem>Utilisateurs</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4 w-100 flex items-baseline gap-2">
        Utilisateurs
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800">
          {filteredItems.length}
        </span>
      </h1>
      <Table
        aria-label="Liste des utilisateurs"
        isHeaderSticky
        removeWrapper
        className="max-h overflow-auto"
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid} align={"start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={filteredItems}
          isLoading={loading}
          emptyContent={currentUser?.role === 'therapist'
  ? "Aucun patient assigné à vous."
  : "Aucun utilisateur trouvé."}
        >
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchUsers}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={fetchUsers}
        user={selectedUser}
      />
      {selectedUser && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onDelete={() => handleDeleteUser(selectedUser.id, selectedUser.role)}
          user={selectedUser}
        />
      )}
      {userForOrderCategories && (
        <OrderCategoriesUserModal
          isOpen={isOrderCategoriesModalOpen}
          onClose={() => {
            setIsOrderCategoriesModalOpen(false);
            setUserForOrderCategories(null);
          }}
          user={userForOrderCategories}
        />
      )}
      <ValidateModal
        open={isValidateModalOpen}
        onClose={handleCloseValidateModal}
        user={userForValidation}
        onValidate={handleValidate}
        onRefuse={handleRefuse}
      />
      <TherapistInfoModal
        open={isTherapistInfoModalOpen}
        onClose={() => {
          setIsTherapistInfoModalOpen(false);
          setUserForTherapistInfo(null);
        }}
        user={userForTherapistInfo}
      />
    </div>
  );
}