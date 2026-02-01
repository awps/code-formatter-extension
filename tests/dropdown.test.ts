/**
 * @jest-environment jsdom
 */

import {
    openDropdown,
    closeDropdown,
    toggleDropdown,
    closeAllDropdowns,
    closeOtherDropdowns,
    updateThemeSelection,
    updateViewCheckbox,
    isInsideDropdownMenu,
    getDropdownMenuFromTrigger,
} from '../src/content/components/dropdown';

describe('dropdown utilities', () => {
    const OPEN_CLASS = 'code-formatter-toolbar__dropdown-menu--open';

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('openDropdown', () => {
        test('should add open class to menu', () => {
            const menu = document.createElement('div');
            openDropdown(menu);
            expect(menu.classList.contains(OPEN_CLASS)).toBe(true);
        });
    });

    describe('closeDropdown', () => {
        test('should remove open class from menu', () => {
            const menu = document.createElement('div');
            menu.classList.add(OPEN_CLASS);
            closeDropdown(menu);
            expect(menu.classList.contains(OPEN_CLASS)).toBe(false);
        });
    });

    describe('toggleDropdown', () => {
        test('should toggle open class', () => {
            const menu = document.createElement('div');

            toggleDropdown(menu);
            expect(menu.classList.contains(OPEN_CLASS)).toBe(true);

            toggleDropdown(menu);
            expect(menu.classList.contains(OPEN_CLASS)).toBe(false);
        });
    });

    describe('closeAllDropdowns', () => {
        test('should close all open dropdowns', () => {
            const menu1 = document.createElement('div');
            const menu2 = document.createElement('div');
            menu1.classList.add(OPEN_CLASS);
            menu2.classList.add(OPEN_CLASS);
            document.body.appendChild(menu1);
            document.body.appendChild(menu2);

            closeAllDropdowns();

            expect(menu1.classList.contains(OPEN_CLASS)).toBe(false);
            expect(menu2.classList.contains(OPEN_CLASS)).toBe(false);
        });
    });

    describe('closeOtherDropdowns', () => {
        test('should close all except the specified menu', () => {
            const menu1 = document.createElement('div');
            const menu2 = document.createElement('div');
            menu1.classList.add(OPEN_CLASS);
            menu2.classList.add(OPEN_CLASS);
            document.body.appendChild(menu1);
            document.body.appendChild(menu2);

            closeOtherDropdowns(menu1);

            expect(menu1.classList.contains(OPEN_CLASS)).toBe(true);
            expect(menu2.classList.contains(OPEN_CLASS)).toBe(false);
        });
    });

    describe('updateThemeSelection', () => {
        test('should update selected theme in dropdown', () => {
            document.body.innerHTML = `
                <div id="theme-menu">
                    <div class="code-formatter-toolbar__dropdown-item" data-theme="githubDark">
                        <span class="code-formatter-toolbar__dropdown-check">○</span> GitHub Dark
                    </div>
                    <div class="code-formatter-toolbar__dropdown-item" data-theme="nord">
                        <span class="code-formatter-toolbar__dropdown-check">○</span> Nord
                    </div>
                </div>
            `;

            updateThemeSelection('theme-menu', 'nord');

            const nordItem = document.querySelector('[data-theme="nord"]');
            const githubDarkItem = document.querySelector('[data-theme="githubDark"]');

            expect(nordItem?.classList.contains('code-formatter-toolbar__dropdown-item--selected')).toBe(true);
            expect(githubDarkItem?.classList.contains('code-formatter-toolbar__dropdown-item--selected')).toBe(false);
            expect(nordItem?.querySelector('.code-formatter-toolbar__dropdown-check')?.textContent).toBe('●');
            expect(githubDarkItem?.querySelector('.code-formatter-toolbar__dropdown-check')?.textContent).toBe('○');
        });
    });

    describe('updateViewCheckbox', () => {
        test('should update toggle state', () => {
            document.body.innerHTML = `
                <div id="view-menu">
                    <div class="code-formatter-toolbar__dropdown-item code-formatter-toolbar__dropdown-item--toggle" data-setting="lineNumbers">
                        <span class="code-formatter-toolbar__dropdown-label">Line Numbers</span>
                        <span class="code-formatter-toolbar__toggle">
                            <span class="code-formatter-toolbar__toggle-track"></span>
                            <span class="code-formatter-toolbar__toggle-thumb"></span>
                        </span>
                    </div>
                </div>
            `;

            updateViewCheckbox('view-menu', 'lineNumbers', true);

            const item = document.querySelector('[data-setting="lineNumbers"]');
            const toggle = item?.querySelector('.code-formatter-toolbar__toggle');
            expect(item?.classList.contains('code-formatter-toolbar__dropdown-item--checked')).toBe(true);
            expect(toggle?.classList.contains('code-formatter-toolbar__toggle--on')).toBe(true);
        });
    });

    describe('isInsideDropdownMenu', () => {
        test('should return true for element inside dropdown menu', () => {
            document.body.innerHTML = `
                <div class="code-formatter-toolbar__dropdown-menu">
                    <div id="inner">Content</div>
                </div>
            `;

            const inner = document.getElementById('inner') as HTMLElement;
            expect(isInsideDropdownMenu(inner)).toBe(true);
        });

        test('should return false for element outside dropdown menu', () => {
            document.body.innerHTML = '<div id="outer">Content</div>';

            const outer = document.getElementById('outer') as HTMLElement;
            expect(isInsideDropdownMenu(outer)).toBe(false);
        });
    });

    describe('getDropdownMenuFromTrigger', () => {
        test('should return menu from trigger', () => {
            document.body.innerHTML = `
                <div class="code-formatter-toolbar__dropdown">
                    <button class="trigger">Trigger</button>
                    <div class="code-formatter-toolbar__dropdown-menu">Menu</div>
                </div>
            `;

            const trigger = document.querySelector('.trigger') as Element;
            const menu = getDropdownMenuFromTrigger(trigger);

            expect(menu).not.toBeNull();
            expect(menu?.className).toBe('code-formatter-toolbar__dropdown-menu');
        });

        test('should return null when no menu exists', () => {
            document.body.innerHTML = `
                <div>
                    <button class="trigger">Trigger</button>
                </div>
            `;

            const trigger = document.querySelector('.trigger') as Element;
            const menu = getDropdownMenuFromTrigger(trigger);

            expect(menu).toBeNull();
        });
    });
});
