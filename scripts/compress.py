import sys
import json
from tokenc import TokenClient

client = TokenClient(api_key="your-api-key")

input_text = sys.argv[1]

response = client.compress_input(
    input=input_text,
    aggressiveness=0.5
)

result = {
    'compressed': response.output,
    'tokens_saved': response.tokens_saved,
    'compression_ratio': response.compression_ratio
}

print(json.dumps(result))
