#include <iostream>
#include <fstream>
#include <iterator>
#include <vector>
#include <string>
#include <cstring>
#include <cstdint>

// in mingw-32 this needs to be defined
// #define uint unsigned int
#define byte unsigned char
#define longer long long
#define ulonger unsigned long long
#define bitcheck(var,pos) ((var) & (1<<(pos)))

// make it not using namespace std eventually
// maybe not depends on the problems i run into with it
using namespace std;

// read funcs
byte readByte (ulonger &i, const byte* &bytes) {
	return bytes[i++];
}

uint readuInt (ulonger &i, const byte* &bytes) {
	return (readByte(i, bytes) << 1*8) + readByte(i, bytes);
};

ulong readuLong (ulonger &i, const byte* &bytes) {
	return (readuInt(i, bytes) << 2*8) + readuInt(i, bytes);
};

ulonger readuLonger (ulonger &i, const byte* &bytes) {
	return (readuLong(i, bytes) << 4*8) + readuLong(i, bytes);
};

string readString (ulonger &i, const byte* &bytes) {
	string tempstr = "";
	while (bytes[i] != 0) {
		tempstr += readByte(i, bytes);
	}
	i++;
	return tempstr;
};

// no clue if i did this right, to be tested when
// compiler lines up
byte* readBytes (ulonger &i, const byte* &bytes) {
	// read bytes length
	ulong length = readuLong(i, bytes);
	// declare return value
	byte* ret;
	// copy bytes in program to return from location i??
	
	// dont know if this is copying from the program byte
	// array or if its copying from the single byte at
	// i, its supposed to resolve to a pointer so i hope
	// i did this right
//	https://www.cplusplus.com/reference/cstring/memcpy/
	memcpy(ret, &bytes[i], length);
	i += length;
	// return value
	return ret;
}

// errors and warnings

void warn(std::string str) {
	printf("\x1B[43m WARN \x1B[49m %s\n", str.data());
}

void info(std::string str) {
	printf("\x1B[43m INFO \x1B[49m %s\n", str.data());
}

void error(std::string str) {
	printf("\x1B[41m ERROR \x1B[49m\x1B[31m %s\n", str.data());
	exit(1);
}

// main
int main (int argc, char *argv[]) {
	if (argc == 1) {
		printf("Please specify an input file.\n");
		return 0;
	}

	ifstream t(argv[1]);
	string str((istreambuf_iterator<char>(t)), istreambuf_iterator<char>());
	ulonger l = str.length();
	ulonger i = 0;
	const byte* bytes = (const byte*)str.c_str();

	bool memalloc = false;


    //header version
    byte headerVer = readByte(i, bytes);

	ulonger meml = 0;
	// read the header
	while (true) {
		byte headerCode = readByte(i, bytes);
		if (headerCode == 0x00) break;
		if (headerCode == 0x01) {
			meml += readuLong(i, bytes);
			memalloc = true;
		}
	}

	if (!memalloc) error("Memory header code not found.");
	byte memory[meml];

	// the program
	while (i < l) {
		byte paramBits = readByte(i, bytes);
		uint opcode = readuInt(i, bytes);
		if (opcode == 0x0001) {
			printf("%s", readString(i, bytes).data());
		} else
		if (opcode == 0x0002) {
			i = readuLong(i, bytes);
		}
		if (opcode == 0x0003) {
			ulonger loc = readuLonger(i, bytes);
			byte* val = readBytes(i, bytes);
			printf("%s",val);
		}
	}
}