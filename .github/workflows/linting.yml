name: Run Linting

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: '12.x'
    - name: Install devDependencies
      run: npm ci
    - name: Run Linting
      run: npm test
