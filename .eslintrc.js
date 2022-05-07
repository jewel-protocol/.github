module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "mocha": true,
        "node": true
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
        "space-before-function-paren": [ "error", { "anonymous": "never", "named": "never", "asyncArrow": "always" }]
    },
    "globals": {
        "ethers": "readonly",
        "task": "readonly",
        "network": "readonly"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};
