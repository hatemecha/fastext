export class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                name: 'Default',
                colors: {
                    bg: '#000000',
                    editorBg: '#000000',
                    editorText: '#ffffff',
                    toolbarBg: '#1a1a1a',
                    toolbarText: '#ffffff',
                    toolbarHover: '#888888',
                    toolbarActive: '#4CAF50',
                    toolbarSeparator: '#666666',
                    placeholder: '#666666',
                    border: '#333333',
                    borderLight: '#2a2a2a',
                    modalBg: '#1a1a1a',
                    modalBorder: '#333333',
                    modalText: '#ffffff',
                    modalSecondary: '#cccccc',
                    inputBg: '#2a2a2a',
                    inputBorder: '#444444',
                    inputFocus: '#4a90e2',
                    buttonPrimary: '#4a90e2',
                    buttonSecondary: '#333333',
                    buttonHover: '#5ba0f2',
                    tabBg: '#1a1a1a',
                    tabActive: '#333333',
                    tabHover: '#2a2a2a',
                    tabText: '#ffffff',
                    tabUnsaved: '#ff4444',
                    tabClose: '#ff4444',
                    searchBg: '#1a1a1a',
                    searchBorder: '#333333',
                    searchText: '#ffffff',
                    searchSelected: '#2a2a2a'
                }
            },
            'base2tone-lavender': {
                name: 'Base2Tone Lavender',
                colors: {
                    bg: '#1a1625',
                    editorBg: '#1a1625',
                    editorText: '#e5dcfe',
                    toolbarBg: '#2d2838',
                    toolbarText: '#e5dcfe',
                    toolbarHover: '#b5a0fe',
                    toolbarActive: '#9375f5',
                    toolbarSeparator: '#7a728f',
                    placeholder: '#625a7c',
                    border: '#2d2838',
                    borderLight: '#3a3448',
                    modalBg: '#2d2838',
                    modalBorder: '#3a3448',
                    modalText: '#e5dcfe',
                    modalSecondary: '#c5adff',
                    inputBg: '#3a3448',
                    inputBorder: '#4b455f',
                    inputFocus: '#9375f5',
                    buttonPrimary: '#9375f5',
                    buttonSecondary: '#3a3448',
                    buttonHover: '#a286fd',
                    tabBg: '#2d2838',
                    tabActive: '#3a3448',
                    tabHover: '#342e42',
                    tabText: '#e5dcfe',
                    tabUnsaved: '#d294ff',
                    tabClose: '#d294ff',
                    searchBg: '#2d2838',
                    searchBorder: '#3a3448',
                    searchText: '#e5dcfe',
                    searchSelected: '#3a3448'
                }
            },
            'base2tone-mall': {
                name: 'Base2Tone Mall',
                colors: {
                    bg: '#1a1a1b',
                    editorBg: '#1a1a1b',
                    editorText: '#f0e5ff',
                    toolbarBg: '#2d2d2f',
                    toolbarText: '#f0e5ff',
                    toolbarHover: '#c5adff',
                    toolbarActive: '#a17efc',
                    toolbarSeparator: '#7a7980',
                    placeholder: '#5e5c60',
                    border: '#2d2d2f',
                    borderLight: '#3a3a3d',
                    modalBg: '#2d2d2f',
                    modalBorder: '#3a3a3d',
                    modalText: '#f0e5ff',
                    modalSecondary: '#d5c5ff',
                    inputBg: '#3a3a3d',
                    inputBorder: '#4a4a4d',
                    inputFocus: '#a17efc',
                    buttonPrimary: '#75bfff',
                    buttonSecondary: '#3a3a3d',
                    buttonHover: '#8ac8ff',
                    tabBg: '#2d2d2f',
                    tabActive: '#3a3a3d',
                    tabHover: '#343436',
                    tabText: '#f0e5ff',
                    tabUnsaved: '#b294ff',
                    tabClose: '#b294ff',
                    searchBg: '#2d2d2f',
                    searchBorder: '#3a3a3d',
                    searchText: '#f0e5ff',
                    searchSelected: '#3a3a3d'
                }
            },
            'ayu-dark': {
                name: 'Ayu Dark',
                colors: {
                    bg: '#0d1117',
                    editorBg: '#0d1117',
                    editorText: '#b3b1ad',
                    toolbarBg: '#1c2128',
                    toolbarText: '#b3b1ad',
                    toolbarHover: '#95e6cb',
                    toolbarActive: '#ff3333',
                    toolbarSeparator: '#4d5566',
                    placeholder: '#4d5566',
                    border: '#1c2128',
                    borderLight: '#2d333b',
                    modalBg: '#1c2128',
                    modalBorder: '#2d333b',
                    modalText: '#b3b1ad',
                    modalSecondary: '#95e6cb',
                    inputBg: '#2d333b',
                    inputBorder: '#4d5566',
                    inputFocus: '#59c2ff',
                    buttonPrimary: '#59c2ff',
                    buttonSecondary: '#2d333b',
                    buttonHover: '#75bfff',
                    tabBg: '#1c2128',
                    tabActive: '#2d333b',
                    tabHover: '#252a32',
                    tabText: '#b3b1ad',
                    tabUnsaved: '#ff3333',
                    tabClose: '#ff3333',
                    searchBg: '#1c2128',
                    searchBorder: '#2d333b',
                    searchText: '#b3b1ad',
                    searchSelected: '#2d333b'
                }
            },
            'gruvbox-dark': {
                name: 'Gruvbox Dark',
                colors: {
                    bg: '#1d2021',
                    editorBg: '#1d2021',
                    editorText: '#f2e5bc',
                    toolbarBg: '#282828',
                    toolbarText: '#f2e5bc',
                    toolbarHover: '#8ec07c',
                    toolbarActive: '#fb4934',
                    toolbarSeparator: '#7c6f64',
                    placeholder: '#928374',
                    border: '#282828',
                    borderLight: '#3c3836',
                    modalBg: '#282828',
                    modalBorder: '#3c3836',
                    modalText: '#f2e5bc',
                    modalSecondary: '#d5c4a1',
                    inputBg: '#3c3836',
                    inputBorder: '#504945',
                    inputFocus: '#fabd2f',
                    buttonPrimary: '#fabd2f',
                    buttonSecondary: '#3c3836',
                    buttonHover: '#d79921',
                    tabBg: '#282828',
                    tabActive: '#3c3836',
                    tabHover: '#32302f',
                    tabText: '#f2e5bc',
                    tabUnsaved: '#fb4934',
                    tabClose: '#fb4934',
                    searchBg: '#282828',
                    searchBorder: '#3c3836',
                    searchText: '#f2e5bc',
                    searchSelected: '#3c3836'
                }
            }
        }
    }

    getTheme(themeId) {
        return this.themes[themeId] || this.themes.default
    }

    getAllThemes() {
        return Object.keys(this.themes).map(id => ({
            id,
            name: this.themes[id].name
        }))
    }

    applyTheme(themeId) {
        const theme = this.getTheme(themeId)
        const root = document.documentElement

        for (const [key, value] of Object.entries(theme.colors)) {
            root.style.setProperty(`--theme-${key}`, value)
        }

        document.body.setAttribute('data-theme', themeId)
    }
}

