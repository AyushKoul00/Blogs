#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time; 

out vec4 fragColor;

struct Ray
{
	vec3 o,d;
};

struct Sphere
{
	vec3 c;
	float r;
};
Sphere s = Sphere(vec3(0.0,0.0,-4.0),1.);

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

mat2 rotate2D(float a)
{
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}


float scene(vec3 pos)
{
	float sphere = length(pos-s.c) - s.r;
    float torus = sdTorus(pos-s.c, vec2(.7, .1));
	float plane = pos.y + s.r;
    float shape = mix(sphere, torus, sin(u_time)*0.5 + 0.5);
  
    return min(shape, plane);
}

vec3 calcNormal(vec3 pos)
{
	vec2 e = vec2(0.0001, 0.0);
	return normalize(vec3(
		scene(pos+e.xyy)-scene(pos-e.xyy),
		scene(pos+e.yxy)-scene(pos-e.yxy),
		scene(pos+e.yyx)-scene(pos-e.yyx)
	));
}

float castRay(Ray r)
{
	float t = 0.0;
	for(int i=0; i<100; ++i)
	{
		vec3 pos = r.o + t*r.d;
		float d = scene(pos);
		if(d < 0.0001)
			break;
		t += d;
		if(t > 20.0)
			break;
	}
	if(t > 20.0) return -1.0;
	return t;
}

void main()
{
//     vec2 temp = gl_FragCoord.xz * rotate2D(sin(u_time) * 0.01);
  
//     vec3 coord = vec3(temp.x, gl_FragCoord.y/gl_FragCoord.z)
  
	vec2 p = (2.0*gl_FragCoord.xy - u_resolution)/min(u_resolution.x,u_resolution.y);
	
    
  
	vec3 col = vec3(0.0, 0.0, 0.0);
	
	Ray r = Ray(vec3(0.0), normalize(vec3(p, -2.0)));

	float t = castRay(r);
	if(t > 0.0)
	{
		vec3 pos = r.o + t*r.d;
		vec3 nor = calcNormal(pos);

		vec3 sun_dir = normalize(vec3(0.8, 0.4, 0.2));
		float sun_dif = clamp(dot(nor, sun_dir), 0.0, 1.0);
		float sun_shadow = step(castRay(Ray(pos+nor*0.001, sun_dir)), 0.0); //t<0 -> 1 otherwise 0

		float sky_dif = clamp(0.5 + 0.5*dot(nor, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);

		col = vec3(1.0, 0.7, 0.5)*sun_dif*sun_shadow;
		col += vec3(0.0, 0.1, 0.3)*sky_dif;
	}
  
    col = pow(col, vec3(.4545));
	fragColor = vec4(col,1.0);
}