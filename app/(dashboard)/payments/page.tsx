import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { payments } from "@/lib/mockData";

export default function Payments() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">View all payment transactions</p>
      </div>

      <Card className="border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="border-border">
                <TableCell className="font-bold text-accent">
                  {payment.amount}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-primary text-primary">
                    {payment.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.date}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.property}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.user}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={payment.status === "Success" ? "default" : "destructive"}
                    className={
                      payment.status === "Success"
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        : ""
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
