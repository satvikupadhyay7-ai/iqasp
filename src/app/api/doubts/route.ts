import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch doubts submitted by the signed-in student,
// including their current name and profile picture.
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    if (profile.role !== "student") {
      return NextResponse.json(
        { error: "Only student accounts can view this page." },
        { status: 403 }
      );
    }

    const { data: doubts, error } = await supabase
      .from("doubts")
      .select(`
        id,
        title,
        subject,
        topic,
        flair,
        description,
        status,
        created_at,
        profiles!doubts_student_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Doubts fetch error:", error.message);

      return NextResponse.json(
        { error: "Unable to fetch doubts." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      doubts: doubts || [],
    });
  } catch (error) {
    console.error("Doubts GET error:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching doubts." },
      { status: 500 }
    );
  }
}

// POST: Submit a new doubt
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    if (profile.role !== "student") {
      return NextResponse.json(
        { error: "Only student accounts can submit doubts." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const subject = String(body.subject || "").trim();
    const topic = String(body.topic || "").trim();
    const flair = String(body.flair || "").trim();
    const description = String(body.description || "").trim();

    if (
      title.length < 5 ||
      title.length > 150 ||
      subject.length === 0 ||
      topic.length === 0 ||
      flair.length === 0 ||
      description.length < 10 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a title (5–150 characters), subject, topic, category, and description (10–5000 characters).",
        },
        { status: 400 }
      );
    }

    const allowedSubjects = [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Computer Science",
      "Biology",
      "Other",
    ];

    const allowedFlairs = [
      "Conceptual",
      "Numerical",
      "Exam Strategy",
      "Homework",
      "Other",
    ];

    if (
      !allowedSubjects.includes(subject) ||
      !allowedFlairs.includes(flair)
    ) {
      return NextResponse.json(
        { error: "Invalid subject or category selected." },
        { status: 400 }
      );
    }

    // New doubts are published by default.
    // You can add a moderation workflow later.
    const { data: doubt, error: insertError } = await supabaseAdmin
      .from("doubts")
      .insert({
        student_id: user.id,
        title,
        subject,
        topic,
        flair,
        description,
        status: "published",
      })
      .select(
        "id, title, subject, topic, flair, description, status, created_at"
      )
      .single();

    if (insertError) {
      console.error("Doubt insert error:", insertError.message);

      return NextResponse.json(
        { error: "Unable to submit your doubt." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        doubt,
        message: "Your doubt has been submitted!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Doubts POST error:", error);

    return NextResponse.json(
      { error: "Something went wrong while submitting your doubt." },
      { status: 500 }
    );
  }
}