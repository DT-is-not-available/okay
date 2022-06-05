# Print
### Parameter Byte
Specifies what type of value the argument is 

Bit 0:
- 0 = Constant
- 1 = Address
  
Bit 1:
- 0 = Number
- 1 = String (terminate at `0x00`)
  
Bits 2 - 7:

- 0bXXXXXX = Number of bytes to read if is number