export const createElement = (html: string): HTMLElement => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  const content = template.content.firstElementChild;

  if (!content) {
    throw new Error('Something went wront with rendering');
  }

  return document.importNode(content, true) as HTMLElement;
}