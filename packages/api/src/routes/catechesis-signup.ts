// ☩ Adicionar este bloco em packages/api/src/routes/content.ts,
// logo depois do handler "Single catechesis unit with lessons" (linha ~92)
// e ANTES do `return null;` final da função handleContentRoutes.
//
// Não precisa de autenticação — é o formulário público de inscrição.

  // Catechesis signup (public registration form)
  if (path === "/api/catechesis-signup" && request.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "JSON inválido" }, 400);
    }

    const unitSlug = String(body.unit_slug ?? "").trim();
    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const agreedToTerms = body.agreed_to_terms === true;

    if (!unitSlug || !fullName || !email) {
      return jsonResponse(
        { error: "Nome completo, e-mail e unidade são obrigatórios." },
        400,
      );
    }
    if (!agreedToTerms) {
      return jsonResponse(
        { error: "É necessário concordar em participar dos encontros e observar os jejuns." },
        400,
      );
    }
    // Sanity check: e-mail com formato básico
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return jsonResponse({ error: "E-mail inválido." }, 400);
    }

    const unit = await env.DB.prepare(
      `SELECT slug FROM catechesis_units WHERE slug = ?`,
    )
      .bind(unitSlug)
      .first();
    if (!unit) return jsonResponse({ error: "Unidade não encontrada." }, 404);

    await env.DB.prepare(
      `INSERT INTO catechesis_signups (unit_slug, full_name, email, phone, birth_date, previous_religion, motivation, agreed_to_terms)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        unitSlug,
        fullName,
        email,
        body.phone ? String(body.phone) : null,
        body.birth_date ? String(body.birth_date) : null,
        body.previous_religion ? String(body.previous_religion) : null,
        body.motivation ? String(body.motivation) : null,
        1,
      )
      .run();

    return jsonResponse({ ok: true });
  }
