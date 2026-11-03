import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch the currently signed-in student's profile
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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      console.error("Profile fetch error:", error?.message);

      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 }
    );
  }
}

// PATCH: Update the student's name and optionally their profile picture
export async function PATCH(request: Request) {
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

    // Only student accounts can use this profile editor
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !existingProfile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    if (existingProfile.role !== "student") {
      return NextResponse.json(
        { error: "Only student accounts can update this profile." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const fullName = String(formData.get("full_name") || "").trim();
    const avatar = formData.get("avatar");

    if (fullName.length < 2 || fullName.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    const updates: {
      full_name: string;
      avatar_url?: string;
    } = {
      full_name: fullName,
    };

    // Upload a new picture only if the user selected one
    if (avatar instanceof File && avatar.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(avatar.type)) {
        return NextResponse.json(
          { error: "Use a JPG, PNG or WebP image." },
          { status: 400 }
        );
      }

      if (avatar.size > 3 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Profile picture must be smaller than 3 MB." },
          { status: 400 }
        );
      }

      const extension =
        avatar.type === "image/png"
          ? "png"
          : avatar.type === "image/webp"
          ? "webp"
          : "jpg";

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const fileBuffer = Buffer.from(await avatar.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(filePath, fileBuffer, {
          contentType: avatar.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError.message);

        return NextResponse.json(
          { error: "Unable to upload profile picture." },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("avatars")
        .getPublicUrl(filePath);

      updates.avatar_url = publicUrlData.publicUrl;
    }

    // Save the updated name and avatar URL
    const { data: updatedProfile, error: updateError } =
      await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select("id, full_name, avatar_url, role")
        .single();

    if (updateError) {
      console.error("Profile update error:", updateError.message);

      return NextResponse.json(
        { error: "Unable to save your profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating your profile." },
      { status: 500 }
    );
  }
}