const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../services/supabase");


// SIGNUP
router.post("/signup", async (req, res) => {
  try {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const { data, error } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    await supabaseAdmin.from("user_roles").insert({
      user_id: data.user.id,
      role: "user"
    });

    res.json({
      message: "Signup success"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});



// LOGIN
router.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    let email = username;

    if (!username.includes("@")) {

      const { data } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();

      if (!data) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      email = data.email;
    }


    const { data, error } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

    if (error || !data.session) {
      return res.status(401).json({ error: "Invalid credentials" });
    }


    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("username,avatar_url")
        .eq("id", data.user.id)
        .single();


    const { data: role } =
      await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();


    res.json({

      message: "Login successful",

      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        isAdmin: !!role
      },

      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }

    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Login failed" });

  }
});



// CURRENT USER
router.get("/me", async (req, res) => {

  try {

    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({ error: "No token" });
    }

    const token = auth.replace("Bearer ", "");

    const { data: { user }, error } =
      await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("username,avatar_url")
        .eq("id", user.id)
        .single();


    const { data: role } =
      await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();


    res.json({

      user: {
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        isAdmin: !!role
      }

    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });

  }

});


module.exports = router;
