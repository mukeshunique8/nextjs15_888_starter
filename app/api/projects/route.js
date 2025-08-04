import connectToDatabase from "@/utils/mongoose";
import Project from "@/models/Project";

export async function GET() {
  try {
    await connectToDatabase(); // Ensure database is connected
    const projects = await Project.find({ activeStatus: true }).sort({ createdAt: -1 });

    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return new Response(JSON.stringify({ message: error.message || "Error Fetching Projects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
