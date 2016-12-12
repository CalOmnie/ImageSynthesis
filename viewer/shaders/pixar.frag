#version 410

uniform float lightIntensity;
uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec4 vertColor;
in vec3 vertNormal;
in vec2 textCoords;
in vec4 texCoords;
in mat3 MG;

out vec4 fragColor;

void main( void )
{
   vec4 Nt = texture(normalTexture, textCoords);
    vec4 V = normalize(eyeVector);

    vec4 L = normalize(lightVector);

    Nt = 2.0*Nt - 1.0;
    Nt.w = 0;
    Nt = normalize(Nt);
    vec4 f = texture(colorTexture, textCoords);


    vec4 nps = normalize( Nt);



    vec4 R = 2*( dot(L, nps) * nps )- L;
    R = normalize(R);
    vec4 Cs = lightIntensity *  pow(max( dot(R, V), 0.0), shininess) *  f;

    vec4 Ca = lightIntensity * f;
    vec4 Cd = lightIntensity * f * max(dot(nps, L),0.0);
    //vec4 Cd = lightIntensity * f * dot(nps, L);
    fragColor =  0.1*Ca +0.3* Cd + 0.6*Cs +0.001*fragColor;

/*float  M_PI = 3.141592;
    float theta = ( atan(texCoords.y,texCoords.x) / M_PI -1 )*0.5 ;
    float phi =  1.0 - acos(texCoords.z) / M_PI;

    vec2 longitudeLatitude = vec2(theta, phi);
    vec4 f = texture2D(colorTexture, longitudeLatitude) ;
    f = vec4(0.5,0.5,0.5,0.0);

    vec4 ng = normalize(vec4(vertNormal, 0.0));

    //Récupération et correction des coordonées du vecteur normal
    vec4 ns = texture2D(normalTexture, longitudeLatitude);
    ns = ns * 2.0 - 1.0 ;
    ns = normalize(ns);
    theta = 2 * M_PI * theta;
    phi = M_PI * phi;



    vec4 L = normalize(lightVector);
    vec4 V = normalize(eyeVector);



    vec4 t = vec4(-sin(phi), cos(phi), 0.0,0.0);

    //Bi tangente : vecteur unitaire tel que b,t,ns soit une base orthogonale directe.
    vec4 b = vec4(cross(t.xyz, ng.xyz), 0.0);
    b = normalize(b);
    //vec4 b = vec4(cos(theta) * cos(phi), cos(phi)* sin(phi), -sin(theta),0.0);


    mat3 Mn = mat3(t.xyz, b.xyz, ng.xyz);

    // n's = Mg * Mn * ns
    vec4 nps = vec4(  MG * Mn * ns.xyz, 0.0);
    nps = normalize( nps);



    vec4 R = 2*( dot(L, nps) * nps )- L;
    R = normalize(R);
    vec4 Cs = lightIntensity *  pow(max( dot(R, V), 0.0), shininess) *  f;
    f = texture(colorTexture, longitudeLatitude);
    vec4 Ca = lightIntensity * f;
    //vec4 Cd = lightIntensity * f * max(dot(nps, L),0.0);
    vec4 Cd = lightIntensity * f * dot(nps, L);
    fragColor =  0.1*Ca +0.3* Cd + 0.6*Cs +0.001*fragColor;*/





}
