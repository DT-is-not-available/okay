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
#define bitcheck(var,pos) ((var) & (1<<(pos)))

// make it not using namespace std eventually
// maybe not depends on the problems i run into with it
using namespace std;

int main(int argc, char *argv[]) {
	if (argc == 1) {
		printf("Please specify an input file.\n");
		return 0;
	}

	ifstream t(argv[1]);
	string str((istreambuf_iterator<char>(t)), istreambuf_iterator<char>());
	long long l = str.length();
	long long i = 0;
	const byte* bytes = (const byte*)str.c_str();

	while (i < l) {
		
	}
}