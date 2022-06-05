# List of instructions
### Not a key to which instructions are which bytes
##### Just a list of future instructions

PLEASE NOTE: 
@ Specifies an address in memory, @@ Specifies the start of a string in memory

- `0x0001`: print `string (message)`
- `0x0002`: jump `longer (location)`
- `0x0003`: set `longer (location)` `bytes (value to store)`
- `0x0004`: fill `longer (location)` `long (amount to clear)` `byte (value to clear to)`
- `0x0005`: exit `byte (err code)`
- `0x0006`: if `byte`
	- notes on if
	- if it fails, ignore the next instruction
	- if it passes, ignore the instruction after that
- goto `longer (location)`
- return
- `0xffff`: memDebug

# Header Information

- Bytes `0x00 - 0x03` specify header version

## Header codes

- `0x00` enter execution
- `0x01` `long (bytes of memory)` allocate memory