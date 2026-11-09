export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Cutvexa AI Worker is ready", {
        headers: corsHeaders
      });
    }

    try {
      if (!env.PIXIAN_API_ID || !env.PIXIAN_API_SECRET) {
        return new Response(
          JSON.stringify({ error: "Pixian API credentials are missing" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const formData = await request.formData();
      const image = formData.get("image");

      if (!image) {
        return new Response(
          JSON.stringify({ error: "Image is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const pixianForm = new FormData();
      pixianForm.append("image", image, image.name || "image.jpg");

      const auth = btoa(
        `${env.PIXIAN_API_ID}:${env.PIXIAN_API_SECRET}`
      );

      const result = await fetch(
        "https://api.pixian.ai/api/v2/remove-background",
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`
          },
          body: pixianForm
        }
      );

      if (!result.ok) {
        const errorText = await result.text();
        return new Response(errorText, {
          status: result.status,
          headers: corsHeaders
        });
      }

      return new Response(result.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": result.headers.get("Content-Type") || "image/png"
        }
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }
};
