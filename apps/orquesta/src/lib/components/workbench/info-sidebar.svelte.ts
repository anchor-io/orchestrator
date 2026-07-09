export class LeftSidebarContext {
  enabled = $state(true);
  width = $state(320);

  toggle() {
    this.enabled = !this.enabled;
  }
}
