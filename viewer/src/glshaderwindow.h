#ifndef GLSHADERWINDOW_H
#define GLSHADERWINDOW_H

#include "openglwindow.h"
#include "TriMesh.h"

#include <QtGui/QGuiApplication>
#include <QtGui/QMatrix4x4>
#include <QtGui/QOpenGLShaderProgram>
#include <QOpenGLFramebufferObject>
#include <QOpenGLBuffer>
#include <QOpenGLTexture>
#include <QtGui/QOpenGLVertexArrayObject>
#include <QtGui/QScreen>
#include <QMouseEvent>


class glShaderWindow : public OpenGLWindow
{
    Q_OBJECT
public:
    glShaderWindow(QWindow *parent = 0);
    ~glShaderWindow();

    void initialize();
    void render();
    void resize(int x, int y);
    void setWorkingDirectory(QString& myPath, QString& myName, QString& texture, QString& normalTexture, QString& envMap);
    inline const QStringList& fragShaderSuffix() { return m_fragShaderSuffix;};
    inline const QStringList& vertShaderSuffix() { return m_vertShaderSuffix;};

public slots:
    void openSceneFromFile();
    void openNewTexture();
    void openNewNormalTexture();
    void openNewEnvMap();
    void saveScene();
    void toggleFullScreen();
    void saveScreenshot();
    void showAuxWindow();
    void setWindowSize(const QString& size);
    void setShader(const QString& size);
    void phongClicked();
    void jadeClicked();
    void shMapClicked();
    void marbleClicked();
    void perlinClicked();
    void woodClicked();
    void pwoodClicked();
    void pwoodSClicked();
    void pbmClicked();
    void bagherClicked();
    void blinnPhongClicked();
    void cookTorranceClicked();
    void goochClicked();
    void xtoonClicked();
    void contourClicked();
    void noContourClicked();
    void transparentClicked();
    void FresnelClicked();
    void opaqueClicked();
    void pnoiseClicked();
    void bpnoiseClicked();
    void fbpClicked();
    void updateContour(int contourSliderValue);
    void updateLightIntensity(int lightSliderValue);
    void updateShininess(int shininessSliderValue);
    void updateEta(int etaSliderValue);
    void updateLac(int lacSliderValue);
    void updateK(int kValue);
    void updatePer(int perValue);
    void updateOct(int OctValue);

protected:
    void mousePressEvent(QMouseEvent *e);
    void mouseMoveEvent(QMouseEvent *e);
    void mouseReleaseEvent(QMouseEvent *e);
    void timerEvent(QTimerEvent *e);
    void resizeEvent(QResizeEvent * ev);
    void wheelEvent(QWheelEvent * ev);


private:
    QOpenGLShaderProgram* prepareShaderProgram(const QString& vertexShaderPath, const QString& fragmentShaderPath);
    void bindSceneToProgram();
    void initializeTransformForScene();
    void initPermTexture();
    void loadTexturesForShaders();
    void openScene();
    void mouseToTrackball(QVector2D &in, QVector3D &out);

    // Model we are displaying:
    QString  workingDirectory;
    QString  modelName;
    QString  textureName;
    QString normalTextureName;
    QString  envMapName;
    trimesh::TriMesh* modelMesh;
    uchar* pixels;
    // Ground
    trimesh::point *g_vertices;
    trimesh::vec *g_normals;
    trimesh::vec2 *g_texcoords;
    trimesh::point *g_colors;
    int *g_indices;
    int g_numPoints;
    int g_numIndices;
    // Parameters controlled by UI
    //modeles de matériaux
    bool blinnPhong;
    bool shMap;
    bool cookTorrance;
    bool phong;
    bool pnoise;
    bool bpnoise;
    bool gooch;
    bool xtoon;
    bool contour;
    bool bagher;
    bool transparent;
    bool marble;
    bool perlin;
    bool jade;
    bool wood;
    bool pwood;
    bool pwoodS;
    bool pbm;
    bool Fresnel;



    float eta;
    float lightIntensity;
    float largeurContour;
    float shininess;
    float lightDistance;
    float groundDistance;
    float oct;
    float lac;
    float per;
    float k;


    // OpenGL variables encapsulated by Qt
    QOpenGLShaderProgram *m_program;
    QOpenGLShaderProgram *ground_program;
    QOpenGLShaderProgram *shadowMapGenerationProgram;
    QOpenGLTexture* environmentMap;
    QOpenGLTexture* texture;
    QOpenGLTexture* normalTexture;
    QOpenGLTexture* normalMap;
    QOpenGLTexture* permTexture;
    // Model
    QOpenGLBuffer m_vertexBuffer;
    QOpenGLBuffer m_indexBuffer;
    QOpenGLBuffer m_normalBuffer;
    QOpenGLBuffer m_colorBuffer;
    QOpenGLBuffer m_texcoordBuffer;
    QOpenGLVertexArrayObject m_vao;
    // Ground
    QOpenGLVertexArrayObject ground_vao;
    QOpenGLBuffer ground_vertexBuffer;
    QOpenGLBuffer ground_indexBuffer;
    QOpenGLBuffer ground_normalBuffer;
    QOpenGLBuffer ground_colorBuffer;
    QOpenGLBuffer ground_texcoordBuffer;
    // Matrix for all objects
    QMatrix4x4 m_matrix[3]; // 0 = object, 1 = light, 2 = ground
    QMatrix4x4 m_perspective;
    // Shadow mapping
    QOpenGLFramebufferObject* shadowMap;
    int shadowMapDimension;

    // User interface variables
    bool fullScreenSnapshots;
    QStringList m_fragShaderSuffix;
    QStringList m_vertShaderSuffix;
    QVector2D lastMousePosition;
    QVector3D lastTBPosition;
    Qt::MouseButton mouseButton;
    float m_screenSize; // max window dimension
    QWidget* auxWidget; // window for parameters

};

#endif // GLSHADERWINDOW_H
