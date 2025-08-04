import connectToDatabase from "@/utils/mongoose";
import User from "@/models/Users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectToDatabase(); // Ensure database is connected

    const body = await req.json();
    const { email, password } = body;

    // Check if email and password are provided
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Ensure you set this environment variable
      { expiresIn: "1d" } // Token expires in 1 day
    );

    return new Response(
      JSON.stringify({
        message: "Login successful",
        token,
        user: { id: user._id, email: user.email, role: user.role },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/login:", error);
    return new Response(JSON.stringify({ message: error.message || "Error during login" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
