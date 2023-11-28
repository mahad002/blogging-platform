
#include <iostream>
#include <pthread.h>

using namespace std;

const int r = 9, c = 9;

int sudoku[r][c] = {
    {1, 2, 3, 4, 5, 6, 7, 8, 9},
    {2, 3, 4, 5, 6, 7, 8, 9, 1},
    {3, 4, 5, 6, 7, 8, 9, 1, 2},
    {4, 5, 6, 7, 8, 9, 1, 2, 3},
    {5, 6, 7, 8, 9, 1, 2, 3, 4},
    {6, 7, 8, 9, 1, 2, 3, 4, 5},
    {7, 8, 9, 1, 2, 3, 4, 5, 6},
    {8, 9, 1, 2, 3, 4, 5, 6, 7},
    {9, 1, 2, 3, 4, 5, 6, 7, 8}
};

bool rowCheck(int row) {
    set<int> s;
    for (int i = 0; i < c; i++) {
        if (s.find(sudoku[row][i]) != s.end()) {
            return false;
        }
        s.insert(sudoku[row][i]);
    }
    return true;
}

bool colCheck(int col) {
    set<int> s;
    for (int i = 0; i < r; i++) {
        if (s.find(sudoku[i][col]) != s.end()) {
            return false;
        }
        s.insert(sudoku[i][col]);
    }
    return true;
}

bool checkSudoku() {
    pthread_t threads[r + c];
    int index = 0;

    for (int i = 0; i < r; i++) {
        pthread_create(&threads[index++], NULL, rowCheck, (void*)i);
    }

    for (int i = 0; i < c; i++) {
        pthread_create(&threads[index++], NULL, colCheck, (void*)i);
    }

    for (int i = 0; i < r + c; i++) {
        pthread_join(threads[i], NULL);
    }

    return true;
}

int main() {
    if (checkSudoku()) {
        cout << "Sudoku is valid" << endl;
    } else {
        cout << "Sudoku is invalid" << endl;
    }
    return 0;
}
