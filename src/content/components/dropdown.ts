import { ThemeKey } from '../../shared/types/settings';

const DROPDOWN_OPEN_CLASS = 'code-formatter-toolbar__dropdown-menu--open';
const DROPDOWN_SELECTED_CLASS = 'code-formatter-toolbar__dropdown-item--selected';
const DROPDOWN_CHECKED_CLASS = 'code-formatter-toolbar__dropdown-item--checked';

/**
 * Opens a dropdown menu.
 */
export function openDropdown(menu: Element): void {
    menu.classList.add(DROPDOWN_OPEN_CLASS);
}

/**
 * Closes a dropdown menu.
 */
export function closeDropdown(menu: Element): void {
    menu.classList.remove(DROPDOWN_OPEN_CLASS);
}

/**
 * Toggles a dropdown menu open/closed.
 */
export function toggleDropdown(menu: Element): void {
    menu.classList.toggle(DROPDOWN_OPEN_CLASS);
}

/**
 * Closes all open dropdowns in the document.
 */
export function closeAllDropdowns(): void {
    document.querySelectorAll(`.${DROPDOWN_OPEN_CLASS}`)
        .forEach(menu => menu.classList.remove(DROPDOWN_OPEN_CLASS));
}

/**
 * Closes all dropdowns except the specified one.
 */
export function closeOtherDropdowns(exceptMenu: Element | null): void {
    document.querySelectorAll(`.${DROPDOWN_OPEN_CLASS}`)
        .forEach(openMenu => {
            if (openMenu !== exceptMenu) {
                openMenu.classList.remove(DROPDOWN_OPEN_CLASS);
            }
        });
}

/**
 * Updates the theme dropdown UI to show the selected theme.
 */
export function updateThemeSelection(menuId: string, selectedTheme: ThemeKey): void {
    const themeMenu = document.getElementById(menuId);
    if (!themeMenu) return;

    themeMenu.querySelectorAll('.code-formatter-toolbar__dropdown-item').forEach(item => {
        const itemTheme = (item as HTMLElement).dataset.theme as ThemeKey;
        const isSelected = itemTheme === selectedTheme;
        const checkSpan = item.querySelector('.code-formatter-toolbar__dropdown-check');

        item.classList.toggle(DROPDOWN_SELECTED_CLASS, isSelected);
        if (checkSpan) {
            checkSpan.textContent = isSelected ? '●' : '○';
        }
    });
}

/**
 * Updates a view dropdown toggle item.
 */
export function updateViewCheckbox(menuId: string, setting: string, checked: boolean): void {
    const viewMenu = document.getElementById(menuId);
    if (!viewMenu) return;

    const item = viewMenu.querySelector(`[data-setting="${setting}"]`);
    if (!item) return;

    const toggle = item.querySelector('.code-formatter-toolbar__toggle');
    item.classList.toggle(DROPDOWN_CHECKED_CLASS, checked);
    if (toggle) {
        toggle.classList.toggle('code-formatter-toolbar__toggle--on', checked);
    }
}

/**
 * Checks if an element is inside a dropdown menu.
 */
export function isInsideDropdownMenu(element: HTMLElement): boolean {
    return element.closest('.code-formatter-toolbar__dropdown-menu') !== null;
}

/**
 * Gets the dropdown menu element from a trigger button.
 */
export function getDropdownMenuFromTrigger(trigger: Element): Element | null {
    const dropdown = trigger.parentElement;
    return dropdown?.querySelector('.code-formatter-toolbar__dropdown-menu') || null;
}
