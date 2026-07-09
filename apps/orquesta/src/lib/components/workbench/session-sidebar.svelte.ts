export class RightSidebarContext {
  enabled = $state(true);
  width = $state(288);

  toggle() {
    this.enabled = !this.enabled;
  }
}
