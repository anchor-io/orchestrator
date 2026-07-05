<script lang="ts">
  import {
    AiWorkbench,
    AiWorkbenchController,
    fixtureScenarios,
    getDefaultScenario,
    type AiWorkbenchSession
  } from '$lib/components/ai/index.js';

  const defaultScenario = getDefaultScenario();
  const controller = new AiWorkbenchController(defaultScenario.snapshot);
  controller.scenarioId = defaultScenario.id;

  const actions = $derived(controller.actions());
  const scenarioSessions = $derived<AiWorkbenchSession[]>(
    fixtureScenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.label,
      status:
        scenario.id === controller.scenarioId
          ? controller.snapshot.run.isStreaming
            ? 'running'
            : controller.snapshot.run.phase === 'error'
              ? 'error'
              : 'settled'
          : 'idle'
    }))
  );

  function selectScenario(sessionId: string) {
    const scenario = fixtureScenarios.find((item) => item.id === sessionId);
    if (scenario) controller.setScenario(scenario);
  }
</script>

<svelte:head>
  <title>AI workbench demo</title>
</svelte:head>

<main class="min-h-dvh bg-background text-foreground">
  <AiWorkbench
    class="min-h-dvh"
    snapshot={controller.snapshot}
    {actions}
    sessions={scenarioSessions}
    activeSessionId={controller.scenarioId}
    onSelectSession={selectScenario}
  />
</main>
