#version 330
#define M_PI 3.14159265358979323846

uniform sampler2D envMap;
uniform mat4 lightMatrix;
uniform bool transparent;
uniform float eta;

in vec4 vertColor;
in vec3 vertNormal;
in vec4 lightVector;
in vec4 eyeVector;

out vec4 fragColor;


void main( void )
{



    vec4 N =  vec4(vertNormal, 0.0);
    vec4 V = normalize(eyeVector);
    N = normalize(N);
    vec4 R = 2*( dot(V, N) * N )- V;
    R = normalize( lightMatrix* R);

//dans un premier temps


    vec2 vN  ;
    float theta = ( atan(-R.y,-R.x) / M_PI -1 )*0.5 ;
    float phi =  1.0 - acos(-R.z) / M_PI;
    vN = vec2(theta, phi);
    vec4 Cs = texture(envMap, vN);
    vec3 H = normalize(-R.xyz + V.xyz);
    float F0 = pow(1.0-eta, 2.0) / pow(1.0+eta, 2.0);
    float F = F0 + (1-F0) * pow(1 - dot(H, V.xyz), 2.0);


// dans un second temps
    vec4 Re = refract(V, -N, 1/eta);
    Re = normalize( lightMatrix *Re);

    float theta2 = ( atan(Re.y,Re.x) / M_PI -1 )*0.5 ;
    float phi2 =  1.0 - acos(Re.z) / M_PI;

    vec2 vN2 = vec2(theta2, phi2);
    vec4 CRef = texture(envMap, vN2);


    if (transparent)
    {

        fragColor = F*Cs + (1-F)*CRef;
    }
    else
    {
        fragColor = Cs;
    }




}
