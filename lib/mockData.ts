// Mock data for the admin dashboard

export const analyticsData = {
  totalUsers: 12847,
  totalProperties: 3421,
  totalBookings: 8956,
  totalRevenue: 2847500,
  todayBookings: 47,
  monthlyRevenue: 387500,
};

export const bookingsPerMonth = [
  { month: "Jan", bookings: 650 },
  { month: "Feb", bookings: 720 },
  { month: "Mar", bookings: 890 },
  { month: "Apr", bookings: 780 },
  { month: "May", bookings: 920 },
  { month: "Jun", bookings: 1050 },
  { month: "Jul", bookings: 1180 },
  { month: "Aug", bookings: 1020 },
  { month: "Sep", bookings: 950 },
  { month: "Oct", bookings: 1100 },
  { month: "Nov", bookings: 980 },
  { month: "Dec", bookings: 816 },
];

export const revenuePerMonth = [
  { month: "Jan", revenue: 285000 },
  { month: "Feb", revenue: 312000 },
  { month: "Mar", revenue: 398000 },
  { month: "Apr", revenue: 356000 },
  { month: "May", revenue: 425000 },
  { month: "Jun", revenue: 478000 },
  { month: "Jul", revenue: 512000 },
  { month: "Aug", revenue: 445000 },
  { month: "Sep", revenue: 398000 },
  { month: "Oct", revenue: 467000 },
  { month: "Nov", revenue: 423000 },
  { month: "Dec", revenue: 387500 },
];

export const users = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Agent" : "Customer",
  status: i % 4 === 0 ? "Inactive" : "Active",
}));

export const properties = Array.from({ length: 30 }, (_, i) => ({
  id: `prop-${i + 1}`,
  title: `Luxury ${i % 3 === 0 ? "Villa" : i % 2 === 0 ? "Apartment" : "Penthouse"} in ${
    ["Downtown", "Beachfront", "Suburbs", "City Center"][i % 4]
  }`,
  type: i % 3 === 0 ? "Villa" : i % 2 === 0 ? "Apartment" : "Penthouse",
  status: i % 5 === 0 ? "Sold" : i % 3 === 0 ? "Pending" : "Available",
  price: (250000 + i * 50000).toLocaleString(),
  image: `https://images.unsplash.com/photo-${
    1600585154340 + i * 1000
  }-4e9c3c9c4f8a?w=400&h=300&fit=crop`,
}));

export const bookings = Array.from({ length: 40 }, (_, i) => ({
  id: `booking-${i + 1}`,
  userName: `Customer ${i + 1}`,
  property: `Property ${(i % 30) + 1}`,
  date: new Date(2024, 10, 1 + i).toLocaleDateString(),
  price: `₹${(2500 + i * 300).toLocaleString()}`,
  status: i % 4 === 0 ? "Cancelled" : i % 3 === 0 ? "Pending" : "Confirmed",
}));

export const payments = Array.from({ length: 35 }, (_, i) => ({
  id: `payment-${i + 1}`,
  amount: `₹${(5000 + i * 1000).toLocaleString()}`,
  method: i % 3 === 0 ? "Credit Card" : i % 2 === 0 ? "Bank Transfer" : "PayPal",
  date: new Date(2024, 10, 1 + i).toLocaleDateString(),
  property: `Property ${(i % 30) + 1}`,
  user: `User ${(i % 50) + 1}`,
  status: i % 5 === 0 ? "Failed" : "Success",
}));

export const reviews = Array.from({ length: 25 }, (_, i) => ({
  id: `review-${i + 1}`,
  user: `Customer ${i + 1}`,
  property: `Property ${(i % 30) + 1}`,
  rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
  comment: "Great property! Excellent service and beautiful location. Highly recommended.",
  date: new Date(2024, 10, 1 + i).toLocaleDateString(),
}));
