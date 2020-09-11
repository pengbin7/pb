package com.pb.netty;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@SpringBootTest
class NettyApplicationTests {

    @Test
    void contextLoads() {
    }

    int[] arr = {1,2,3,4,5,6,7,8,9,0};

    @Test
    void run(){
        Set<String> collect = Arrays.stream(arr).mapToObj(NettyApplicationTests::t).collect(Collectors.toSet());
        Iterator<String> iterator = collect.iterator();
        while (iterator.hasNext()){
            System.err.println(iterator.next());
        }
    }

    @Test
    void run2(){
        List<String> collect = Arrays.stream(arr).mapToObj(NettyApplicationTests::t).collect(Collectors.toList());
        for (int i = 0; i < collect.size(); i++) {
            System.err.println(collect.get(i));
        }
    }

    public static String t(int i){
        return i+":number";
    }

}
