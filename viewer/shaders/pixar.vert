#version 330

uniform mat4 matrix;
uniform mat4 perspective;
uniform mat3 normalMatrix;
uniform bool noColor;
uniform vec3 lightPosition;

in vec3 vertex;
in vec3 normal;
in vec3 color;
in vec2 texcoords;

out mat3 MG;
out vec4 eyeVector;
out vec4 lightVector;
out vec4 vertColor;
out vec3 vertNormal;
out vec2 textCoords;

varying vec4 texCoords;

void main( void )
{
    if (noColor) vertColor = vec4(0.2, 0.6, 0.7, 1.0 );
    else vertColor = vec4(color, 1.0);
    vec4 vertPosition = matrix * vec4(vertex, 1.0);
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 1.0);
    // For illumination:
    /* eyeVector = ...
    lightVector = ... */
// Here begins the real work.
    eyeVector = eyePosition - vertPosition;
    MG = normalMatrix;

    lightVector = vertPosition - matrix * vec4(lightPosition,1.0);

    // For texture mapping:
    textCoords = texcoords;

    vertNormal = normalize(normalMatrix * normal);
    gl_Position = perspective * matrix * vec4(vertex, 1.0);
    texCoords = vec4(vertex,1.0);
}
