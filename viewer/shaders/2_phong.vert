#version 330

uniform mat4 matrix;
uniform mat4 perspective;
uniform mat4 worldToLightSpace;
uniform mat3 normalMatrix;
uniform bool noColor;
uniform vec3 lightPosition;

in vec3 vertex;
in vec3 normal;
in vec3 color;

out vec4 eyeVector;
out vec4 lightVector;
out vec4 vertColor;
out vec3 vertNormal;
out vec4 lightSpace;
// out vec4 gl_Position;

void main( void )
{
    if (noColor) vertColor = vec4(0.2, 0.6, 0.7, 1.0 );
    else vertColor = vec4(color, 1.0);
    vec4 vertPosition = matrix * vec4(vertex, 1.0);
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 1.0);
    // Here begins the real work.
    eyeVector = eyePosition - vertPosition;

    lightVector = vertPosition - matrix * vec4(lightPosition,1.0);
    vertNormal = normalize(normalMatrix * normal);

    lightSpace = worldToLightSpace * vec4(vertex, 1.0);


    gl_Position = perspective * matrix * vec4(vertex, 1.0);
}
