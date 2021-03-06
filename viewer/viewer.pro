DESTDIR = .
QT       += core gui opengl

CONFIG += silent
TARGET = myViewer
TEMPLATE = app

macx {
  QMAKE_CXXFLAGS += -Wno-unknown-pragmas -std=c++14
} else {
  QMAKE_CXXFLAGS += -Wno-unused-parameter -Wno-reorder -Wno-unused-function -Wno-switch -Wno-unused-result -Wno-unknown-pragmas -fopenmp -std=c++14
}

SOURCES +=  \
            src/main.cpp \
            src/openglwindow.cpp \
            src/glshaderwindow.cpp

HEADERS  += \
            src/openglwindow.h \
            src/glshaderwindow.h \
    src/perlinNoise.h

RESOURCES += shaders/core-profile.qrc
OTHER_FILES +=  \
                shaders/brick.vert \
                shaders/brick.frag \
                shaders/noiseMarble.vert \
                shaders/noiseMarble.frag \
                shaders/noiseJade.vert \
                shaders/noiseJade.frag \
                shaders/noiseWood.frag \
    shaders/1_simple.frag \
    shaders/1_simple.vert \
    shaders/2_phong.frag \
    shaders/2_phong.vert \
    shaders/3_textured.frag \
    shaders/3_textured.vert \
    shaders/4_earth.frag \
    shaders/4_earth.vert \
    shaders/5_envMap.frag \
    shaders/5_envMap.vert \
    shaders/noiseAlone.frag \
    shaders/noiseAlone.vert \
    shaders/h_shadowMapGeneration.frag \
    shaders/h_shadowMapGeneration.vert

# trimesh library for loading objects.
# Reference/source: http://gfx.cs.princeton.edu/proj/trimesh2/
INCLUDEPATH += ../trimesh2/include/

LIBS += -L../trimesh2/lib -ltrimesh

