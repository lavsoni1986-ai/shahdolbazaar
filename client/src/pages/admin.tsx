import { SHOPS } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, LayoutDashboard } from "lucide-react";

export default function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
             <LayoutDashboard className="h-8 w-8 text-primary" />
             Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage shops, categories, and listings.</p>
        </div>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" /> Add New Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Total Shops</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{SHOPS.length}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Verified Businesses</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-orange-600">{SHOPS.filter(s => s.featured).length}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{SHOPS.reduce((acc, curr) => acc + curr.reviews, 0)}</div>
           </CardContent>
         </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
           <h2 className="font-semibold text-lg">Registered Shops</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SHOPS.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="capitalize">{shop.category}</Badge>
                  </TableCell>
                  <TableCell>
                     {shop.featured ? (
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Verified</Badge>
                     ) : (
                       <Badge variant="secondary">Standard</Badge>
                     )}
                  </TableCell>
                  <TableCell>{shop.rating} ★</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
