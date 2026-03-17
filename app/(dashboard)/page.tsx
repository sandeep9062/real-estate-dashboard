import { redirect } from "next/navigation";

const Index = () => {
  // This is a server component, but we need to check auth on client side
  // The actual auth check will be handled by the AdminLayout component
  redirect("/dashboard");
};

export default Index;
