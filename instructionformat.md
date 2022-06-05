# Program Header
the program header loops until the header instruction is 0,
reading a byte for a header instruction, and then
parameters afterward until it reaches the end of the
parameters

# instruction format for bytecode
0b`00000000` - the 8 bit switches for the 8 max parameters.
decides if an instruction parameter uses a literal value,
or a reference to a variable/memory chunk. Specified in the
order of first bit being to the left, and last to the right.

0x`0000` - the 2 byte instruction opcode, specifies what to
do (for example, 0x`0000` for exit, 0x`0001` for print,
`0x29F3` for doing foo, etc.)

then parameters are provided and read as follows

 - **Byte** - 
1 single bytes is read

 - **Integer** - 
2 bytes are read

 - **Long** - 
4 bytes are read

 - **Longer** - 
8 bytes are read

 - **String** - 
all bytes are read up until the next 0x`00` byte, and the
final null byte is ingored and skipped

 - **Bytes** -
a long is read, specifying the length of the remaining
bytes.

when reading a memory address, it is read as a 64 bit longer
(8 bytes), and the value taken from memory follows the
rules of the original value type (specified above),
starting with the position specified

value types are not kept track of in memory, meaning
something originally stored as a string could be read as
an integer, and vise versa. 