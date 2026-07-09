<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<main class="min-h-dvh bg-background p-6 text-foreground">
  <nav class="mx-auto grid max-w-sm border-y border-border text-sm">
    <a class="border-b border-border py-2 hover:text-primary" href={resolve('/demo/ai')}>
      ai workbench
    </a>
    <a class="border-b border-border py-2 hover:text-primary" href={resolve('/demo/paraglide')}>
      paraglide
    </a>
    <a class="py-2 hover:text-primary" href={resolve('/demo/playwright')}>playwright</a>
  </nav>
</main>
