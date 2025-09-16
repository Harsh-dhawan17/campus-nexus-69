import { BookOpen, Search, Download, Calendar, Clock, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface LibraryProps {
  user: User;
}

export default function Library({ user }: LibraryProps) {
  const borrowedBooks = [
    { 
      id: "1", 
      title: "Data Structures and Algorithms", 
      author: "Thomas H. Cormen",
      dueDate: "2024-02-15",
      daysLeft: 8,
      isbn: "978-0262033848"
    },
    { 
      id: "2", 
      title: "Clean Code", 
      author: "Robert C. Martin",
      dueDate: "2024-02-10",
      daysLeft: 3,
      isbn: "978-0132350884"
    },
    { 
      id: "3", 
      title: "Design Patterns", 
      author: "Gang of Four",
      dueDate: "2024-02-20",
      daysLeft: 13,
      isbn: "978-0201633612"
    },
  ];

  const availableBooks = [
    { 
      title: "JavaScript: The Good Parts", 
      author: "Douglas Crockford",
      available: 5,
      total: 8,
      category: "Programming",
      rating: 4.5
    },
    { 
      title: "System Design Interview", 
      author: "Alex Xu",
      available: 3,
      total: 6,
      category: "Computer Science",
      rating: 4.8
    },
    { 
      title: "Cracking the Coding Interview", 
      author: "Gayle McDowell",
      available: 2,
      total: 10,
      category: "Programming",
      rating: 4.6
    },
    { 
      title: "Operating Systems Concepts", 
      author: "Abraham Silberschatz",
      available: 7,
      total: 12,
      category: "Computer Science",
      rating: 4.3
    },
  ];

  const digitalLibrary = [
    { 
      title: "Artificial Intelligence: A Modern Approach", 
      type: "PDF",
      size: "15.2 MB",
      downloads: 1250,
      category: "AI/ML"
    },
    { 
      title: "Computer Networks", 
      type: "eBook",
      size: "8.7 MB",
      downloads: 890,
      category: "Networking"
    },
    { 
      title: "Database System Concepts", 
      type: "PDF",
      size: "22.1 MB",
      downloads: 2100,
      category: "Database"
    },
  ];

  const fines = [
    { book: "Introduction to Algorithms", amount: 50, days: 5, paid: false },
    { book: "Computer Organization", amount: 30, days: 3, paid: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library Management</h1>
          <p className="text-muted-foreground">Browse, borrow, and manage your books</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Digital Library
          </Button>
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Search className="mr-2 h-4 w-4" />
            Search Books
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-soft bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title, author, ISBN..." className="pl-9" />
            </div>
            <Button className="bg-gradient-primary">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active borrows</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Within 3 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Books</CardTitle>
            <BookOpen className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,420</div>
            <p className="text-xs text-muted-foreground">Total collection</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fines</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹50</div>
            <p className="text-xs text-muted-foreground">1 overdue book</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="borrowed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="borrowed">My Books</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="digital">Digital Library</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Currently Borrowed Books</CardTitle>
              <CardDescription>Books you have checked out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowedBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gradient-primary rounded flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={book.daysLeft <= 3 ? "destructive" : "secondary"}
                        className="mb-2"
                      >
                        Due in {book.daysLeft} days
                      </Badge>
                      <p className="text-sm text-muted-foreground">Due: {book.dueDate}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Renew
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Available Books</CardTitle>
              <CardDescription>Browse and reserve books from our collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBooks.map((book, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-background/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{book.category}</Badge>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-warning mr-1" />
                            <span className="text-xs">{book.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-12 bg-gradient-secondary rounded flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {book.available} of {book.total} available
                      </span>
                      <Button size="sm" className="bg-gradient-primary" disabled={book.available === 0}>
                        {book.available > 0 ? "Borrow" : "Reserve"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Digital Library</CardTitle>
              <CardDescription>Access PDFs, e-books, and digital resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalLibrary.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-secondary rounded flex items-center justify-center">
                        <Download className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{resource.type} • {resource.size}</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                        <Badge variant="outline" className="mt-1">{resource.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Preview</Button>
                      <Button size="sm" className="bg-gradient-primary">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fines" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Library Fines</CardTitle>
              <CardDescription>Manage your library fines and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fines.map((fine, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div>
                      <h4 className="font-medium">{fine.book}</h4>
                      <p className="text-sm text-muted-foreground">
                        {fine.days} days overdue
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold">₹{fine.amount}</div>
                        <Badge variant={fine.paid ? "default" : "destructive"}>
                          {fine.paid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      {!fine.paid && (
                        <Button size="sm" className="bg-gradient-primary">
                          Pay Fine
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Pending Fines:</span>
                    <span className="text-xl font-bold">₹{fines.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}