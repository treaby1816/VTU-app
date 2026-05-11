import sys

with open('src/app/globals.css', 'rb') as f:
    data = f.read()

# Replace null bytes
clean_data = data.replace(b'\x00', b'')

with open('src/app/globals.css', 'wb') as f:
    f.write(clean_data)
print("Cleaned!")
