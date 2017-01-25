#version 330

in vec3 vertColor;
in vec3 vertNormal;
in float depth;

out float fragColor;


void main( void )
{
     fragColor = gl_FragCoord.z;
}
