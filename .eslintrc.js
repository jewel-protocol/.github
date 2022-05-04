module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": { "jsx": true },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [ "error", 4 ],
        "linebreak-style": [ "error", "unix" ],
        "quotes": [ "error", "double" ],
        "semi": [ "error", "always" ],
        "no-unused-vars": "off",
        "space-before-function-paren": [ "error", "never" ]
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};
