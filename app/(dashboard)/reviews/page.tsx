import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { reviews } from "@/lib/mockData";

export default function Reviews() {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-yellow-500 text-yellow-500"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Customer reviews and ratings</p>
      </div>

      <Card className="border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className="border-border">
                <TableCell className="font-medium">{review.user}</TableCell>
                <TableCell className="text-muted-foreground">
                  {review.property}
                </TableCell>
                <TableCell>{renderStars(review.rating)}</TableCell>
                <TableCell className="max-w-md text-muted-foreground">
                  <p className="line-clamp-2">{review.comment}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {review.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
