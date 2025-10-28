
import  { useState, useMemo } from "react";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useCreateUSerMutation, useDeleteUsersByIdMutation, useGetUsersQuery, useUpdateUsersByIdMutation } from "@/store/userApi";
import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";
import { NavDropdown } from "./navDropDown";


export function UserManagement() {
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = useQueryParamsState();

  const { data, error, isLoading, refetch } = useGetUsersQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUSerMutation();
  const [deleteUserMutation] = useDeleteUsersByIdMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUsersByIdMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<null | { id: string; username: string; email: string; role: string; first_name: string;  last_name:string}>(null);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "" as UserRole,
    password: "",
  });

  const user: any = jwtDecode(localStorage.getItem("access_token") || "");
  const canEdit = user?.role === "admin";
  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, selectedRole]);

  const resetForm = () => {
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      role: "cashier",
      password: "",
    });
    setEditingUser(null);
  };

  const handleEdit = async (user: any) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      
    });
    setFormData({
      username: user.username,
      first_name: user.first_name ,  
      last_name: user.last_name ,
      email: user.email,
      role: user.role,
      password: "",
    });

   
    setIsAddDialogOpen(true);
  };
const handleDelete = (userId: string, firstName: string) => {
  toast.custom((id) => (
    <div className="flex flex-col gap-2 p-3">
      <span className="font-medium">
        Are you sure you want to delete <b>{firstName}</b>?
      </span>
      <span className="text-sm text-gray-500">
        This will permanently delete the user.
      </span>
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={async () => {
            try {
              const res = deleteUserMutation(userId);
              if (!res) throw new Error("Failed to delete");
                refetch();
              toast.success("User deleted successfully");
            } catch (err) {
              toast.error("Failed to delete user");
            } finally {
              toast.dismiss(id); // close toast after action
            }
          }
          
          
          }
        >
          Delete
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => toast.dismiss(id)}
        >
          Cancel
        </button>
      </div>
    </div>
  )
    ,
  { duration: Infinity }
  );
};
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default"
      case "pharmacist":
        return "secondary"
      case "cashier":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
if (editingUser) {
  try {
    await updateUser({
      id: editingUser.id, // id comes from editingUser
      ...formData, // the updated form values
    }).unwrap();

    toast.success("User updated successfully");
    resetForm();
    setIsAddDialogOpen(false);
    refetch();
  } catch (err: any) {
    toast.error("Failed to update user");
  }
} else {
  try {
    await createUser(formData).unwrap();
    resetForm();
    setIsAddDialogOpen(false);
    refetch();
  } catch (err: any) {
    toast.error(`${err?.data?.message || "Failed to add user"}`);
  }
}

  };


  return (
    <div className="min-h-screen bg-background">
        <div className="fixed top-4 right-4 z-50">
              <NavDropdown />
            </div>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl text-lg  font-bold text-primary">
              User Management
            </h1>
          </div>
          {canEdit && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Update user information"
                      : "Enter the details for the new user"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    {!editingUser && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: UserRole) =>
                          setFormData((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="storeManager">Store Manager</SelectItem>
                          {/* <SelectItem value="cashier">Cashier</SelectItem> */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={editingUser ? isUpdating : isCreating}>
                      {editingUser
                        ? isUpdating ? "Updating..." : "Update User"
                        : isCreating
                        ? "Adding..."
                        : "Add User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Owner</SelectItem>
              <SelectItem value="pharmacist">Pharmacist</SelectItem>
              {/* <SelectItem value="cashier">Cashier</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Manage system users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading users...</div>
              ) : error ? (
                <div>Error loading users</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">
                          {user.username}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.first_name || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.last_name || "-"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(user.role as UserRole)}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                // variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(user.id.toString(), user.first_name)}
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((data?.count || 0) / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
