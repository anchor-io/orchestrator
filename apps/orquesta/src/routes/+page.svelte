<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { resolve } from '$app/paths';
</script>

<main class="grid min-h-dvh content-center bg-background p-6 text-foreground">
  <div class="mx-auto grid w-full max-w-sm gap-3 border-y border-border py-5">
    <h1 class="text-sm font-medium">Orquesta</h1>
    <Button href={resolve('/demo/ai')} variant="outline">AI workbench demo</Button>
  </div>
</main>
