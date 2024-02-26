#!/bin/bash

# Run npm run production
npm run production

# Check if the command was successful
if [ $? -ne 0 ]; then
    echo "npm run production failed"
    exit 1
fi

# If the command was successful, zip the src directory
zip -r code-formatter.zip ./src

# Check if the zip command was successful
if [ $? -ne 0 ]; then
    echo "zip command failed"
    exit 1
fi

echo "src directory zipped successfully"
