QT       += core gui opengl

TARGET = myViewer
TEMPLATE = subdirs
SUBDIRS += trimesh2 viewer
CONFIG += silent ordered
QMAKE_CXXFLAGS += -Wno-unused-parameter -Wno-reorder -Wno-unused-function -Wno-switch -Wno-unused-result -Wno-unknown-pragmas -fopenmp
