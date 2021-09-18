# akka-api-react-client

Analyser Demo

http://localhost:8080/api/data

```ts
{
"dateTimeFrom" : "2021-01-01T00:01:01",
"dateTimeUntil": "2021-12-30T23:58:58",
"phrase": "kernel"
}

```

Output

```ts
{
    "data": [
        {
            "datetime": "2021-11-27T08:05:57",
            "highlightText": [
                {
                    "fromPosition": 8,
                    "toPosition": 13
                },
                {
                    "fromPosition": 16,
                    "toPosition": 21
                }
            ],
            "message": "galileo kernel: Kernel log daemon terminating."
        },
        {
            "datetime": "2021-11-27T08:05:57",
            "highlightText": [
                {
                    "fromPosition": 8,
                    "toPosition": 13
                },
                {
                    "fromPosition": 16,
                    "toPosition": 21
                }
            ],
            "message": "galileo kernel: Kernel logging (proc) stopped."
        },
        {
            "datetime": "2021-06-01T22:20:05",
            "highlightText": [
                {
                    "fromPosition": 8,
                    "toPosition": 13
                },
                {
                    "fromPosition": 16,
                    "toPosition": 21
                }
            ],
            "message": "secserv kernel: Kernel log daemon terminating."
        },
        {
            "datetime": "2021-06-01T22:20:05",
            "highlightText": [
                {
                    "fromPosition": 8,
                    "toPosition": 13
                },
                {
                    "fromPosition": 16,
                    "toPosition": 21
                }
            ],
            "message": "secserv kernel: Kernel logging (proc) stopped."
        }
    ],
    "dateTimeFrom": "2021-01-01T00:01:01",
    "dateTimeUntil": "2021-12-30T23:58:58",
    "phrase": "kernel"
}
```
